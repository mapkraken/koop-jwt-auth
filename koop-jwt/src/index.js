require('dotenv').config();
const config = require('config');
const Koop = require('@koopjs/koop-core');
const registerAuthRoutes = require('./auth/auth');

console.log('CONFIG:', config);

const koop = new Koop();

// Basic CORS for development
koop.server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Health check endpoint (no authentication required)
koop.server.get('/health', (req, res) => {
  let version = '0.1.0';
  try {
    version = require('../package.json').version || '0.1.0';
  } catch (error) {
    console.warn('Could not load version from package.json:', error.message);
  }
  
  res.json({
    status: 'OK',
    message: 'Koop JWT Auth Example Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: version,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Register authentication routes
registerAuthRoutes(koop);

// Resolve config with environment variables
const resolvedConfig = JSON.parse(
  JSON.stringify(config).replace(/\$\{(\w+)\}/g, (_, name) => process.env[name] || '')
);

// Start the server
const port = resolvedConfig.port || 9000;
koop.server.listen(port, () => {
  console.log(`🚀 Koop JWT Auth Example Server listening on port ${port}`);
  console.log(`📖 Health check: http://localhost:${port}/health`);
  console.log(`🔐 Auth endpoints: http://localhost:${port}/auth/health`);
});