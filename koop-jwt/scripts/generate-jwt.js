const jwt = require('jsonwebtoken');
require('dotenv').config();

// Use the same secret as in your .env file, or create a new one
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

// Create a dummy token with some test data
const token = jwt.sign({
  sub: 'test-user-123',
  email: 'test@example.com',
  name: 'Test User',
  // Add any other claims you might need
  orgId: 'test-org-123',
  role: 'admin'
}, JWT_SECRET);

console.log('Generated Token:', token);
console.log('\nAdd this to your .env file as:');
console.log('DUMMY_TOKEN=' + token); 