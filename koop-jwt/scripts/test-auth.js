const axios = require('axios');

const BASE_URL = 'http://localhost:9000';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testEndpoint(name, method, url, data = null) {
  try {
    console.log(`\n🔍 Testing: ${name}`);
    
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      timeout: 5000
    };
    
    if (data) {
      config.data = data;
      config.headers = { 'Content-Type': 'application/json' };
    }
    
    const response = await axios(config);
    console.log(`✅ Success (${response.status}):`, JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    if (error.response) {
      console.log(`❌ Error (${error.response.status}):`, JSON.stringify(error.response.data, null, 2));
    } else if (error.code === 'ECONNREFUSED') {
      console.log(`❌ Error: Server not running on ${BASE_URL}`);
      console.log(`   Start the server with: npm start`);
    } else {
      console.log(`❌ Error:`, error.message);
    }
    return null;
  }
}

async function runAuthTests() {
  console.log('🔐 Koop JWT Authentication Test Suite');
  console.log('=====================================');
  
  // Wait a bit for server to be ready
  await sleep(1000);
  
  // Test 1: Server Health
  await testEndpoint('Server Health', 'GET', '/health');
  
  // Test 2: Auth Health
  await testEndpoint('Auth Service Health', 'GET', '/auth/health');
  
  // Test 3: User Authentication
  const authData = {
    userId: 'test-user-123',
    email: 'test@example.com',
    orgId: 'test-org-123',
    firstName: 'Test',
    lastName: 'User'
  };
  
  const authResult = await testEndpoint('User Authentication', 'POST', '/auth/params', authData);
  
  // Test 4: Token Verification
  if (authResult && authResult.sessionToken) {
    console.log(`\n🔑 Session token received: ${authResult.sessionToken.substring(0, 50)}...`);
    await testEndpoint('Token Verification', 'GET', `/auth/verify?token=${authResult.sessionToken}`);
  } else {
    console.log('\n❌ No session token received, skipping verification test');
  }
  
  // Test 5: Invalid Token
  await testEndpoint('Invalid Token Test', 'GET', '/auth/verify?token=invalid.token.here');
  
  console.log('\n🎉 Authentication test suite complete!');
  console.log('\nAvailable endpoints:');
  console.log('- GET  /health - Server health check');
  console.log('- GET  /auth/health - Auth service health');
  console.log('- POST /auth/params - User authentication');
  console.log('- POST /auth/token - Generic JWT exchange');
  console.log('- POST /auth/salesforce - Salesforce JWT exchange');
  console.log('- GET  /auth/verify - Token verification');
}

// Run the tests
runAuthTests().catch(console.error); 