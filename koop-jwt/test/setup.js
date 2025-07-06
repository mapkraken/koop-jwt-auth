// Test environment setup
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.SALESFORCE_JWT_SECRET = 'test-salesforce-secret';
process.env.PORT = '9000';

// Set longer timeout for integration tests
require('mocha').timeout(10000);

console.log('🧪 Test environment configured');
console.log('   - NODE_ENV:', process.env.NODE_ENV);
console.log('   - JWT_SECRET: ***');
console.log('   - PORT:', process.env.PORT); 