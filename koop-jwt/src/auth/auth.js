const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';
const SALESFORCE_JWT_SECRET = process.env.SALESFORCE_JWT_SECRET || 'development-secret-key-256-bit-replace-in-production';

module.exports = function(koop) {
  const router = express.Router();

  // Helper function to determine JWT type and verify accordingly
  const verifyToken = async (token) => {
    let decoded;
    let tokenType = 'unknown';

    try {
      // First, try to decode without verification to check the payload
      const unverified = jwt.decode(token);
      
      if (!unverified) {
        throw new Error('Invalid JWT format');
      }
      // Check for Salesforce JWT Bearer tokens
      if (unverified.iss && unverified.iss.startsWith('3MVG') && unverified.aud && unverified.aud.includes('salesforce.com')) {
        console.log('🔍 Detected Salesforce JWT Bearer token');
        tokenType = 'salesforce-bearer';
        
        // For now, treat as regular JWT - would need Salesforce integration for full exchange
        throw new Error('Salesforce JWT Bearer token exchange not implemented');
      }

      console.log('Token issuer:', unverified.iss || 'none');
      console.log('Token audience:', unverified.aud || 'none');
      
      // Check if it's a Koop session token first
      if (unverified.aud === 'koop-session' && unverified.iss === 'koop-server') {
        console.log('🔍 Detected Koop session JWT');
        tokenType = 'session';
        
        // Verify with standard secret
        decoded = jwt.verify(token, JWT_SECRET, {
          algorithms: ['HS256'],
          audience: 'koop-session',
          issuer: 'koop-server'
        });
        
      } else if (unverified.aud === 'koop-gis-server' && unverified.orgId) {
        console.log('🔍 Detected Salesforce JWT');
        tokenType = 'salesforce';
        
        // Verify with Salesforce secret
        decoded = jwt.verify(token, SALESFORCE_JWT_SECRET, {
          algorithms: ['HS256'],
          audience: 'koop-gis-server'
        });
        
      } else if (unverified.iss && unverified.iss.includes('salesforce.com')) {
        console.log('🔍 Detected Salesforce domain JWT');
        tokenType = 'salesforce';
        
        // Alternative verification for Salesforce domain JWTs
        decoded = jwt.verify(token, SALESFORCE_JWT_SECRET, {
          algorithms: ['HS256']
        });
        
      } else {
        console.log('🔍 Detected generic/session JWT');
        tokenType = 'session';
        
        // Verify with standard secret
        decoded = jwt.verify(token, JWT_SECRET);
      }

      return { decoded, tokenType };
      
    } catch (error) {
      console.error('Token verification failed:', error.message);
      throw error;
    }
  };

  // Exchange external JWT for session token (original endpoint)
  router.post('/token', async (req, res) => {
    console.log('=== Generic Token Exchange Request ===');
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ 
        error: 'No token provided',
        message: 'JWT token is required' 
      });
    }

    try {
      const { decoded, tokenType } = await verifyToken(token);
      console.log('Token type:', tokenType);
      console.log('Token verified successfully');

      // Create session token
      const sessionToken = jwt.sign({
        sub: decoded.sub || decoded.userId,
        email: decoded.email,
        name: decoded.name,
        userId: decoded.userId || decoded.sub,
        orgId: decoded.orgId,
        source: tokenType
      }, JWT_SECRET, { 
        expiresIn: '8h',
        audience: 'koop-session',
        issuer: 'koop-server'
      });

      console.log('✅ Session token created successfully');

      res.json({ 
        sessionToken,
        user: {
          id: decoded.userId || decoded.sub,
          name: decoded.name,
          email: decoded.email,
          orgId: decoded.orgId
        },
        tokenType: tokenType
      });

    } catch (error) {
      console.error('❌ Token exchange failed:', error.message);
      res.status(401).json({ 
        error: 'Invalid token',
        message: error.message,
        hint: 'Check that the JWT is valid and not expired'
      });
    }
  });

  // New dedicated Salesforce JWT endpoint
  router.post('/salesforce', (req, res) => {
    console.log('=== Salesforce Token Exchange Request ===');
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ 
        error: 'No token provided',
        message: 'Salesforce JWT is required'
      });
    }

    try {
      console.log('Verifying Salesforce JWT...');
      
      // Verify Salesforce JWT specifically
      const decoded = jwt.verify(token, SALESFORCE_JWT_SECRET, {
        algorithms: ['HS256'],
        audience: 'koop-gis-server'
      });

      console.log('Salesforce JWT verified successfully');
      console.log('User:', decoded.name, '(' + decoded.email + ')');
      console.log('Org ID:', decoded.orgId);
      console.log('User ID:', decoded.userId);
      console.log('Permissions:', decoded.permissions);

      // Extract comprehensive user information
      const user = {
        id: decoded.userId,
        salesforceId: decoded.sub,
        name: decoded.name,
        email: decoded.email,
        username: decoded.username,
        orgId: decoded.orgId,
        profileName: decoded.profileName,
        userType: decoded.userType
      };

      const permissions = decoded.permissions || [];

      // Create Koop session token with Salesforce context
      const sessionToken = jwt.sign(
        {
          userId: user.id,
          salesforceId: user.salesforceId,
          email: user.email,
          name: user.name,
          username: user.username,
          orgId: user.orgId,
          profileName: user.profileName,
          permissions: permissions,
          source: 'salesforce',
          sessionId: Date.now() // Add session tracking
        },
        JWT_SECRET,
        { 
          expiresIn: '8h',
          audience: 'koop-session',
          issuer: 'koop-server'
        }
      );

      console.log('✅ Salesforce session token created');
      console.log(`User ${user.name} authenticated from Salesforce org ${user.orgId}`);

      res.json({
        success: true,
        sessionToken: sessionToken,
        user: user,
        permissions: permissions,
        expiresIn: '8h',
        metadata: {
          originalTokenExpiry: new Date(decoded.exp * 1000).toISOString(),
          sessionCreated: new Date().toISOString(),
          source: 'salesforce',
          orgId: user.orgId
        }
      });

    } catch (error) {
      console.error('❌ Salesforce authentication failed:', error.message);
      
      let errorMessage = 'Invalid Salesforce token';
      let statusCode = 401;
      
      if (error.name === 'TokenExpiredError') {
        errorMessage = 'Salesforce token has expired';
        statusCode = 401;
      } else if (error.name === 'JsonWebTokenError') {
        errorMessage = 'Invalid Salesforce token format or signature';
        statusCode = 401;
      } else if (error.name === 'NotBeforeError') {
        errorMessage = 'Salesforce token not yet valid';
        statusCode = 401;
      }

      res.status(statusCode).json({
        success: false,
        error: errorMessage,
        details: error.message,
        hint: 'Please return to Salesforce and generate a new token'
      });
    }
  });

  // Test endpoint to verify tokens (helpful for debugging)
  router.get('/verify', async (req, res) => {
    console.log('=== Token Verification Request ===');
    const token = req.query.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(400).json({ 
        error: 'No token provided',
        message: 'Provide token in query param or Authorization header'
      });
    }

    try {
      const { decoded, tokenType } = await verifyToken(token);
      
      res.json({
        valid: true,
        tokenType: tokenType,
        claims: {
          issuer: decoded.iss || 'none',
          audience: decoded.aud || 'none',
          subject: decoded.sub || decoded.userId,
          userId: decoded.userId || decoded.sub,
          name: decoded.name,
          email: decoded.email,
          orgId: decoded.orgId,
          permissions: decoded.permissions,
          issuedAt: new Date(decoded.iat * 1000).toISOString(),
          expiresAt: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : 'no expiry',
          timeUntilExpiry: decoded.exp ? Math.round((decoded.exp * 1000 - Date.now()) / 1000 / 60) + ' minutes' : 'no expiry'
        }
      });

    } catch (error) {
      res.status(401).json({
        valid: false,
        error: error.message,
        tokenType: 'invalid'
      });
    }
  });

  // Salesforce params authentication endpoint (for direct Salesforce data)
  router.post('/params', async (req, res) => {
    try {
      console.log('=== Salesforce Params Authentication ===');
      const authData = req.body;
      
      // Validate required fields
      if (!authData.userId || !authData.email || !authData.orgId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: userId, email, orgId'
        });
      }

      console.log('Salesforce auth data received:', {
        userId: authData.userId,
        email: authData.email,
        orgId: authData.orgId
      });

      // Create proper JWT session token
      console.log('Creating JWT session token');
      
      // Create JWT payload
      const jwtPayload = {
        sub: authData.userId,
        userId: authData.userId,
        email: authData.email,
        name: `${authData.firstName} ${authData.lastName}`.trim() || authData.email,
        orgId: authData.orgId,
        firstName: authData.firstName,
        lastName: authData.lastName,
        userType: authData.userType,
        timeZone: authData.timeZone,
        locale: authData.locale
      };
      
      const sessionToken = jwt.sign(jwtPayload, JWT_SECRET, {
        algorithm: 'HS256',
        expiresIn: '8h',
        audience: 'koop-session',
        issuer: 'koop-server'
      });
      
      const user = {
        name: `${authData.firstName} ${authData.lastName}`.trim() || authData.email,
        email: authData.email,
        userId: authData.userId,
        orgId: authData.orgId
      };
      
      console.log('✅ Salesforce authentication successful');
      return res.json({
        success: true,
        sessionToken,
        user
      });
      
    } catch (error) {
      console.error('Salesforce params authentication error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Health check endpoint
  router.get('/health', (req, res) => {
    res.json({
      status: 'OK',
      message: 'Koop Authentication Service is running',
      endpoints: [
        'POST /auth/token - Generic token exchange',
        'POST /auth/salesforce - Salesforce JWT exchange',
        'POST /auth/params - Salesforce params authentication', 
        'GET /auth/verify - Token verification',
        'GET /auth/health - Health check'
      ],
      timestamp: new Date().toISOString()
    });
  });

  koop.server.use('/auth', router);
  
  console.log('🔐 Koop Authentication routes registered:');
  console.log('  POST /auth/token - Generic token exchange');
  console.log('  POST /auth/salesforce - Salesforce JWT exchange');
  console.log('  POST /auth/params - Salesforce params authentication');
  console.log('  GET /auth/verify - Token verification');
  console.log('  GET /auth/health - Health check');
};