const jwt = require('jsonwebtoken');

const JWT_SECRET = 'test-secret-key';

console.log('🔍 JWT Debug Script');
console.log('==================');

// Test 1: Create a token like the params endpoint does
console.log('\n1. Creating token like params endpoint...');
const jwtPayload = {
  sub: 'test-user-123',
  userId: 'test-user-123',
  email: 'test@example.com',
  name: 'Test User',
  orgId: 'test-org-123',
  firstName: 'Test',
  lastName: 'User'
};

const sessionToken = jwt.sign(jwtPayload, JWT_SECRET, {
  algorithm: 'HS256',
  expiresIn: '8h',
  audience: 'koop-session',
  issuer: 'koop-server'
});

console.log('✅ Token created successfully');
console.log('Token (first 50 chars):', sessionToken.substring(0, 50) + '...');

// Test 2: Decode without verification to see structure
console.log('\n2. Decoding token without verification...');
const decoded = jwt.decode(sessionToken);
console.log('Decoded payload:', JSON.stringify(decoded, null, 2));

// Test 3: Verify token like the auth system does
console.log('\n3. Verifying token...');
try {
  const verified = jwt.verify(sessionToken, JWT_SECRET, {
    algorithms: ['HS256'],
    audience: 'koop-session',
    issuer: 'koop-server'
  });
  console.log('✅ Token verified successfully!');
  console.log('Verified payload:', JSON.stringify(verified, null, 2));
} catch (error) {
  console.log('❌ Token verification failed:', error.message);
}

// Test 4: Test the verifyToken function logic
console.log('\n4. Testing verifyToken function logic...');
try {
  const unverified = jwt.decode(sessionToken);
  
  if (!unverified) {
    throw new Error('Invalid JWT format');
  }
  
  console.log('Token issuer:', unverified.iss || 'none');
  console.log('Token audience:', unverified.aud || 'none');
  
  // Check detection logic
  if (unverified.aud === 'koop-session' && unverified.iss === 'koop-server') {
    console.log('🔍 Detected Koop session JWT');
    
    const verified = jwt.verify(sessionToken, JWT_SECRET, {
      algorithms: ['HS256'],
      audience: 'koop-session',
      issuer: 'koop-server'
    });
    
    console.log('✅ Verification successful in verifyToken logic!');
    console.log('Claims available:');
    console.log('- issuer:', verified.iss || 'none');
    console.log('- audience:', verified.aud || 'none');
    console.log('- subject:', verified.sub || 'none');
    console.log('- userId:', verified.userId || 'none');
    console.log('- email:', verified.email || 'none');
    
  } else {
    console.log('❌ Token not recognized as Koop session');
  }
  
} catch (error) {
  console.log('❌ Error in verifyToken logic:', error.message);
}

console.log('\n✅ Debug complete!'); 