const { expect } = require('chai');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'test-secret-key';
const SALESFORCE_JWT_SECRET = 'test-salesforce-secret';

describe('JWT Utilities', function() {

  describe('Token Creation', function() {
    
    it('should create valid session tokens', function() {
      const payload = {
        sub: 'user-123',
        userId: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        orgId: 'org-123'
      };

      const token = jwt.sign(payload, JWT_SECRET, {
        algorithm: 'HS256',
        expiresIn: '8h',
        audience: 'koop-session',
        issuer: 'koop-server'
      });

      expect(token).to.be.a('string');
      expect(token.split('.')).to.have.length(3);
      
      // Verify token can be decoded
      const decoded = jwt.decode(token);
      expect(decoded).to.have.property('sub', 'user-123');
      expect(decoded).to.have.property('aud', 'koop-session');
      expect(decoded).to.have.property('iss', 'koop-server');
    });

    it('should create tokens with proper expiration', function() {
      const payload = { userId: 'test-123' };
      const token = jwt.sign(payload, JWT_SECRET, {
        expiresIn: '1h',
        audience: 'koop-session',
        issuer: 'koop-server'
      });

      const decoded = jwt.decode(token);
      const now = Math.floor(Date.now() / 1000);
      const oneHourFromNow = now + (60 * 60);

      expect(decoded.exp).to.be.greaterThan(now);
      expect(decoded.exp).to.be.lessThan(oneHourFromNow + 60); // Allow 1 minute variance
    });

  });

  describe('Token Verification', function() {
    
    let validToken;

    beforeEach(function() {
      validToken = jwt.sign(
        {
          sub: 'user-123',
          userId: 'user-123',
          email: 'test@example.com',
          name: 'Test User'
        },
        JWT_SECRET,
        {
          algorithm: 'HS256',
          expiresIn: '1h',
          audience: 'koop-session',
          issuer: 'koop-server'
        }
      );
    });

    it('should verify valid tokens', function() {
      expect(() => {
        jwt.verify(validToken, JWT_SECRET, {
          algorithms: ['HS256'],
          audience: 'koop-session',
          issuer: 'koop-server'
        });
      }).to.not.throw();
    });

    it('should reject tokens with wrong secret', function() {
      expect(() => {
        jwt.verify(validToken, 'wrong-secret', {
          algorithms: ['HS256'],
          audience: 'koop-session',
          issuer: 'koop-server'
        });
      }).to.throw('invalid signature');
    });

    it('should reject tokens with wrong audience', function() {
      expect(() => {
        jwt.verify(validToken, JWT_SECRET, {
          algorithms: ['HS256'],
          audience: 'wrong-audience',
          issuer: 'koop-server'
        });
      }).to.throw('jwt audience invalid');
    });

    it('should reject tokens with wrong issuer', function() {
      expect(() => {
        jwt.verify(validToken, JWT_SECRET, {
          algorithms: ['HS256'],
          audience: 'koop-session',
          issuer: 'wrong-issuer'
        });
      }).to.throw('jwt issuer invalid');
    });

    it('should reject expired tokens', function() {
      const expiredToken = jwt.sign(
        { userId: 'user-123' },
        JWT_SECRET,
        {
          algorithm: 'HS256',
          expiresIn: '-1h', // Expired 1 hour ago
          audience: 'koop-session',
          issuer: 'koop-server'
        }
      );

      expect(() => {
        jwt.verify(expiredToken, JWT_SECRET, {
          algorithms: ['HS256'],
          audience: 'koop-session',
          issuer: 'koop-server'
        });
      }).to.throw('jwt expired');
    });

    it('should reject malformed tokens', function() {
      const malformedTokens = [
        'not.a.jwt',
        'invalid.token.here',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9', // Only header
        'header.payload', // Missing signature
        ''
      ];

      malformedTokens.forEach(token => {
        expect(() => {
          jwt.verify(token, JWT_SECRET, {
            algorithms: ['HS256'],
            audience: 'koop-session',
            issuer: 'koop-server'
          });
        }).to.throw();
      });
    });

  });

  describe('Token Decoding', function() {
    
    it('should decode token payload without verification', function() {
      const payload = {
        sub: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        custom: 'data'
      };

      const token = jwt.sign(payload, JWT_SECRET, {
        algorithm: 'HS256',
        expiresIn: '1h',
        audience: 'koop-session',
        issuer: 'koop-server'
      });

      const decoded = jwt.decode(token);
      
      expect(decoded).to.have.property('sub', 'user-123');
      expect(decoded).to.have.property('email', 'test@example.com');
      expect(decoded).to.have.property('name', 'Test User');
      expect(decoded).to.have.property('custom', 'data');
      expect(decoded).to.have.property('aud', 'koop-session');
      expect(decoded).to.have.property('iss', 'koop-server');
      expect(decoded).to.have.property('iat');
      expect(decoded).to.have.property('exp');
    });

    it('should return null for invalid token', function() {
      const invalidTokens = ['not-a-jwt', '', null, undefined];
      
      invalidTokens.forEach(token => {
        const decoded = jwt.decode(token);
        expect(decoded).to.be.null;
      });
    });

  });

  describe('Salesforce JWT Handling', function() {
    
    it('should create Salesforce-compatible tokens', function() {
      const salesforcePayload = {
        userId: 'sf-user-123',
        email: 'salesforce@example.com',
        name: 'SF User',
        orgId: 'sf-org-123',
        permissions: ['read', 'write']
      };

      const token = jwt.sign(salesforcePayload, SALESFORCE_JWT_SECRET, {
        algorithm: 'HS256',
        expiresIn: '8h',
        audience: 'koop-gis-server'
      });

      const decoded = jwt.decode(token);
      expect(decoded).to.have.property('userId', 'sf-user-123');
      expect(decoded).to.have.property('orgId', 'sf-org-123');
      expect(decoded).to.have.property('permissions');
      expect(decoded.permissions).to.deep.equal(['read', 'write']);
      expect(decoded).to.have.property('aud', 'koop-gis-server');
    });

    it('should verify Salesforce tokens with correct secret', function() {
      const token = jwt.sign(
        {
          userId: 'sf-user-123',
          orgId: 'sf-org-123'
        },
        SALESFORCE_JWT_SECRET,
        {
          algorithm: 'HS256',
          audience: 'koop-gis-server'
        }
      );

      expect(() => {
        jwt.verify(token, SALESFORCE_JWT_SECRET, {
          algorithms: ['HS256'],
          audience: 'koop-gis-server'
        });
      }).to.not.throw();
    });

  });

}); 