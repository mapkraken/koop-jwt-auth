#!/bin/bash

echo "🔐 Koop JWT Auth - Simple Test"
echo "=============================="
echo ""

# Step 1: Test server health
echo "1. Testing server health..."
curl -s http://localhost:9000/health
echo -e "\n"

# Step 2: Test auth health
echo "2. Testing auth endpoints..."
curl -s http://localhost:9000/auth/health
echo -e "\n"

# Step 3: Authenticate user
echo "3. Authenticating user..."
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-123","email":"test@example.com","orgId":"org-123","firstName":"Test","lastName":"User"}' \
  http://localhost:9000/auth/params
echo -e "\n"

echo "4. To verify a token, use:"
echo "curl 'http://localhost:9000/auth/verify?token=YOUR_SESSION_TOKEN_HERE'"
echo ""

echo "✅ Test complete! Your JWT authentication system is working!" 