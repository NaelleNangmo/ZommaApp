const dotenv = require('dotenv');
const path = require('path');

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, '../.env') });

// Validation des variables d'environnement requises
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Variables d\'environnement manquantes:', missingEnvVars.join(', '));
  console.error('Veuillez créer un fichier .env basé sur .env.example');
  process.exit(1);
}

// Configuration par défaut
const config = {
  // Base de données
  database: {
    url: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production'
  },
  
  // Serveur
  server: {
    port: parseInt(process.env.PORT) || 3001,
    env: process.env.NODE_ENV || 'development'
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  
  // CORS
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000'
  },
  
  // Sécurité
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
};

// Validation de la configuration
if (config.server.port < 1 || config.server.port > 65535) {
  console.error('❌ PORT doit être entre 1 et 65535');
  process.exit(1);
}

if (config.security.bcryptRounds < 10 || config.security.bcryptRounds > 15) {
  console.warn('⚠️  BCRYPT_ROUNDS recommandé entre 10 et 15 pour un équilibre sécurité/performance');
}

console.log('✅ Configuration d\'environnement chargée avec succès');
console.log(`📊 Environnement: ${config.server.env}`);
console.log(`🚀 Port: ${config.server.port}`);
console.log(`🔒 JWT expire dans: ${config.jwt.expiresIn}`);

module.exports = config;