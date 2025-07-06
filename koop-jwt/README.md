# Koop JWT Authentication Example

A minimal Koop project demonstrating JWT authentication implementation.

This project showcases how to implement JWT authentication in a [Koop](https://koopjs.github.io/) server with support for multiple token types including Salesforce JWT tokens.

## Features

- Generic JWT token exchange
- Salesforce JWT authentication
- Token verification endpoints
- Session token management
- Multiple authentication flows

## Authentication Endpoints

- `POST /auth/token` - Generic JWT token exchange
- `POST /auth/salesforce` - Salesforce-specific JWT authentication  
- `POST /auth/params` - Salesforce parameters authentication
- `GET /auth/verify` - Token verification
- `GET /auth/health` - Authentication service health check

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Set environment variables:
```bash
export JWT_SECRET="your-secret-key"
export SALESFORCE_JWT_SECRET="your-salesforce-secret"
export PORT=9000
```

3. Start the server:
```bash
npm start
```

4. Test the server:
```bash
curl http://localhost:9000/health
curl http://localhost:9000/auth/health
```

## Testing

### Automated Testing

Run the comprehensive authentication test suite:
```bash
npm run test:auth
```

This will automatically test:
- Server health endpoints
- User authentication flow
- Session token generation
- Token verification
- Error handling

### Manual Testing

**Health Checks:**
```bash
npm run auth:health
curl http://localhost:9000/health
curl http://localhost:9000/auth/health
```

**User Authentication:**
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"userId":"test-123","email":"test@example.com","orgId":"org-123","firstName":"Test","lastName":"User"}' \
  http://localhost:9000/auth/params
```

**Token Verification:**
```bash
curl "http://localhost:9000/auth/verify?token=YOUR_SESSION_TOKEN_HERE"
```

### Debug Utilities

Test JWT creation and verification logic:
```bash
npm run test:debug
```

Generate test JWT tokens:
```bash
npm run generate:test:jwt
npm run generate:salesforce:jwt
```

### Available Test Scripts

- `npm run test:auth` - Complete authentication test suite
- `npm run test:debug` - JWT creation/verification debugging
- `npm run auth:health` - Quick health check
- `npm run generate:test:jwt` - Generate generic test JWT
- `npm run generate:salesforce:jwt` - Generate Salesforce test JWT
- `npm test` - Run unit tests (if any)

## Development

### Development Server

Start with auto-reload:
```bash
npm run start:dev
```

## Configuration

The application uses the [config](https://www.npmjs.com/package/config) package for configuration management. Environment variables can be used in the configuration files using the `${VARIABLE_NAME}` syntax.

## Authentication Flow

1. Client sends JWT token to authentication endpoint
2. Server verifies token using appropriate secret
3. Server issues session token for subsequent requests
4. Client uses session token for authenticated requests

For more details about Koop, check the [Koop documentation](https://koopjs.github.io/docs/).
