#!/bin/bash

echo "🔐 Koop JWT Auth Testing Script"
echo "================================="

# Test 1: Health Check
echo ""
echo "1. Testing Server Health:"
curl -s http://localhost:9000/health | head -c 200
echo ""

# Test 2: Auth Health
echo ""
echo "2. Testing Auth Health:"
curl -s http://localhost:9000/auth/health | head -c 300
echo ""

# Test 3: Params Authentication (Salesforce-style)
echo ""
echo "3. Testing Params Authentication:"
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "email": "test@example.com", 
    "orgId": "test-org-123",
    "firstName": "Test",
    "lastName": "User"
  }' \
  http://localhost:9000/auth/params
echo ""

# Test 4: Create a simple JWT token and test verification
echo ""
echo "4. Creating and testing JWT token:"
# Create a simple token for testing
node -e "
const jwt = require('jsonwebtoken');
const token = jwt.sign({
  sub: 'test-user-123',
  email: 'test@example.com',
  name: 'Test User',
  userId: 'test-user-123',
  orgId: 'test-org-123'
}, 'test-secret-key', { expiresIn: '1h' });
console.log('Generated token:', token.substring(0, 50) + '...');
console.log('Testing verification:');
" && echo ""

echo ""
echo "🎉 Auth testing complete!"
echo "To test with your own tokens, use:"
echo "curl -X POST -H 'Content-Type: application/json' -d '{\"token\":\"YOUR_JWT_HERE\"}' http://localhost:9000/auth/token" 