const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Charger la configuration d'environnement en premier
const config = require('./config/env');
const { pool, testConnection } = require('./config/database');
const { requestLogger, errorLogger, log, logEvent } = require('./middleware/logging');
const { sanitizeInput } = require('./middleware/validation');

const app = express();

// Affichage des informations de démarrage
console.log(`\n🚀 Démarrage de ${config.app?.name || 'ZOMA SARL'} Backend API`);
console.log(`📊 Version: ${config.app?.version || '1.0.0'}`);
console.log(`🌍 Environnement: ${config.server.env}`);
console.log(`🔧 Port: ${config.server.port}`);

// Test de connexion à la base de données au démarrage
testConnection().then(success => {
  if (success) {
    logEvent('DATABASE_CONNECTED', { 
      environment: config.server.env,
      port: config.server.port 
    });
  } else {
    logEvent('DATABASE_CONNECTION_FAILED', { 
      environment: config.server.env 
    });
  }
});

// Middleware de sécurité
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// Configuration CORS
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    error: 'Trop de requêtes, veuillez réessayer plus tard',
    retryAfter: Math.ceil(config.rateLimit.windowMs / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    log('warn', `Rate limit dépassé pour IP: ${req.ip}`, {
      url: req.url,
      userAgent: req.get('User-Agent')
    });
    res.status(429).json({
      error: 'Trop de requêtes, veuillez réessayer plus tard',
      retryAfter: Math.ceil(config.rateLimit.windowMs / 1000)
    });
  }
});

app.use('/api/', limiter);

// Middleware de logging des requêtes
app.use(requestLogger);

// Middleware de parsing et sanitisation
app.use(express.json({ 
  limit: '10mb',
  type: 'application/json'
}));
app.use(express.urlencoded({ 
  extended: true,
  limit: '10mb'
}));
app.use(sanitizeInput);

// Routes API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/depots', require('./routes/depots'));
app.use('/api/products', require('./routes/products'));
app.use('/api/fournisseurs', require('./routes/fournisseurs'));
app.use('/api/users', require('./routes/users'));
app.use('/api/stocks', require('./routes/stocks'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/livreurs', require('./routes/livreurs'));
app.use('/api/livraisons', require('./routes/livraisons'));

// Health check endpoint amélioré
app.get('/api/health', async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Test de connexion à la base de données
    const dbConnected = await testConnection();
    const responseTime = Date.now() - startTime;
    
    const healthData = {
      status: dbConnected ? 'OK' : 'DEGRADED',
      timestamp: new Date().toISOString(),
      service: config.app?.name || 'ZOMA SARL Backend API',
      version: config.app?.version || '1.0.0',
      environment: config.server.env,
      uptime: process.uptime(),
      responseTime: `${responseTime}ms`,
      database: {
        connected: dbConnected,
        type: 'PostgreSQL'
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB'
      }
    };

    res.status(dbConnected ? 200 : 503).json(healthData);
    
    logEvent('HEALTH_CHECK', {
      status: healthData.status,
      responseTime: healthData.responseTime,
      dbConnected
    });
    
  } catch (error) {
    log('error', 'Erreur lors du health check', error);
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      service: config.app?.name || 'ZOMA SARL Backend API',
      error: 'Service indisponible'
    });
  }
});

// Route d'information sur l'API
app.get('/api/info', (req, res) => {
  res.json({
    name: config.app?.name || 'ZOMA SARL Backend API',
    version: config.app?.version || '1.0.0',
    description: 'API de gestion des dépôts de boissons',
    environment: config.server.env,
    contact: {
      email: config.app?.email || 'contact@zoma.cm',
      support: config.app?.supportEmail || 'support@zoma.cm'
    },
    endpoints: {
      auth: '/api/auth',
      depots: '/api/depots',
      products: '/api/products',
      fournisseurs: '/api/fournisseurs',
      users: '/api/users',
      stocks: '/api/stocks',
      sales: '/api/sales',
      livreurs: '/api/livreurs',
      livraisons: '/api/livraisons'
    }
  });
});

// Middleware de gestion des erreurs
app.use(errorLogger);

// Gestionnaire 404
app.use('*', (req, res) => {
  log('warn', `Route non trouvée: ${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  res.status(404).json({ 
    error: 'Route non trouvée',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Gestion propre de l'arrêt du serveur
const gracefulShutdown = (signal) => {
  console.log(`\n🛑 Signal ${signal} reçu, arrêt en cours...`);
  
  server.close(() => {
    logEvent('SERVER_SHUTDOWN', { signal });
    console.log('✅ Serveur HTTP fermé');
    process.exit(0);
  });

  // Force l'arrêt après 10 secondes
  setTimeout(() => {
    console.error('❌ Arrêt forcé après timeout');
    process.exit(1);
  }, 10000);
};

// Démarrage du serveur
const server = app.listen(config.server.port, () => {
  console.log(`\n✅ Serveur démarré avec succès!`);
  console.log(`🌐 URL: http://localhost:${config.server.port}`);
  console.log(`🏥 Health check: http://localhost:${config.server.port}/api/health`);
  console.log(`📋 Info API: http://localhost:${config.server.port}/api/info`);
  console.log(`📧 Contact: ${config.app?.email || 'contact@zoma.cm'}`);
  console.log(`\n🎯 Prêt à recevoir des requêtes!\n`);
  
  logEvent('SERVER_STARTED', {
    port: config.server.port,
    environment: config.server.env,
    pid: process.pid
  });
});

// Gestion des signaux d'arrêt
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
  log('error', 'Exception non capturée', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  log('error', 'Promesse rejetée non gérée', { reason, promise });
  gracefulShutdown('UNHANDLED_REJECTION');
});

module.exports = app;