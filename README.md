# Koop JWT Authentication Example

This repository demonstrates how to implement JWT (JSON Web Token) authentication in a Koop application. It provides a complete example of token-based authentication, including Salesforce JWT integration, token verification, and comprehensive testing.

## Features

- JWT token generation and verification
- Salesforce JWT authentication integration
- Multiple authentication endpoints
- Comprehensive test suite
- Simple configuration

## Project Structure

```
koop-jwt-auth/
├── package.json         # Root package.json with test and development scripts
├── README.md           # This documentation
└── koop-jwt/           # Main application directory
    ├── config/
    │   └── default.json      # Server configuration
    ├── src/
    │   ├── auth/
    │   │   └── auth.js      # Authentication implementation
    │   └── index.js         # Server setup
    ├── test/
    │   ├── auth.test.js     # Integration tests
    │   └── jwt-utils.test.js # Unit tests
    └── scripts/
        ├── debug-auth.js    # Debugging utilities
        ├── generate-jwt.js  # JWT generation script
        └── test-auth.js     # Test runner
```

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/koop-jwt-auth.git
   cd koop-jwt-auth
   ```

2. Install dependencies:
   ```bash
   cd koop-jwt && npm install
   ```

3. Create a `.env` file based on `sample.env`:
   ```bash
   cp koop-jwt/sample.env koop-jwt/.env
   ```

4. Start the server:
   ```bash
   # From the root directory
   npm start
   ```

## Authentication Endpoints

- `POST /auth/token` - Generate a JWT token
- `POST /auth/salesforce` - Authenticate with Salesforce JWT
- `POST /auth/params` - Authenticate with Salesforce parameters
- `GET /auth/verify` - Verify a JWT token
- `GET /auth/health` - Check authentication service health

## Testing

The project includes both unit and integration tests. All test commands can be run from the root directory:

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run tests in watch mode
npm run test:watch
```

### Manual Testing

You can use the provided scripts to test the authentication endpoints (run from root directory):

```bash
# Test token generation
npm run generate:jwt

# Test authentication flow
npm run test:auth

# Debug authentication
npm run debug:auth
```

## Configuration

Server configuration is managed through `koop-jwt/config/default.json`. Key settings include:

- `port`: Server port (default: 8080)
- `jwtSecret`: Secret key for JWT signing
- `tokenExpiry`: Token expiration time

## Development

To set up the development environment:

1. Install dependencies:
   ```bash
   cd koop-jwt && npm install
   ```

2. Start the server in development mode:
   ```bash
   # From the root directory
   npm run dev
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 