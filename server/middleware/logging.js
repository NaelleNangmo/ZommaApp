const config = require('../config/env');

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Niveaux de log
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

const currentLogLevel = logLevels[config.logging.level] || logLevels.info;

// Fonction de logging personnalisée
const log = (level, message, data = null) => {
  if (logLevels[level] > currentLogLevel) return;

  const timestamp = new Date().toISOString();
  const color = {
    error: colors.red,
    warn: colors.yellow,
    info: colors.blue,
    debug: colors.cyan
  }[level] || colors.white;

  const logMessage = `${color}[${timestamp}] ${level.toUpperCase()}: ${message}${colors.reset}`;
  
  console.log(logMessage);
  
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
};

// Middleware de logging des requêtes
const requestLogger = (req, res, next) => {
  const start = Date.now();
  const { method, url, ip } = req;
  
  // Log de la requête entrante
  log('info', `${method} ${url} - IP: ${ip}`);

  // Intercepter la réponse
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 400 ? colors.red : 
                       res.statusCode >= 300 ? colors.yellow : colors.green;
    
    log('info', `${method} ${url} - ${statusColor}${res.statusCode}${colors.reset} - ${duration}ms`);
    
    // Log des erreurs
    if (res.statusCode >= 400) {
      log('warn', `Erreur ${res.statusCode} pour ${method} ${url}`, {
        status: res.statusCode,
        duration: `${duration}ms`,
        userAgent: req.get('User-Agent'),
        body: req.body
      });
    }
    
    originalSend.call(this, data);
  };

  next();
};

// Middleware de gestion des erreurs avec logging
const errorLogger = (err, req, res, next) => {
  const { method, url, ip } = req;
  
  log('error', `Erreur serveur pour ${method} ${url}`, {
    error: err.message,
    stack: err.stack,
    ip,
    userAgent: req.get('User-Agent'),
    body: req.body,
    params: req.params,
    query: req.query
  });

  // Réponse d'erreur
  const isDevelopment = config.server.env === 'development';
  
  res.status(err.status || 500).json({
    error: 'Erreur interne du serveur',
    message: isDevelopment ? err.message : 'Une erreur est survenue',
    timestamp: new Date().toISOString(),
    path: url,
    ...(isDevelopment && { stack: err.stack })
  });
};

// Fonction pour logger les événements de l'application
const logEvent = (event, details = {}) => {
  log('info', `Événement: ${event}`, details);
};

// Fonction pour logger les métriques de performance
const logPerformance = (operation, duration, details = {}) => {
  const level = duration > 1000 ? 'warn' : 'info';
  log(level, `Performance: ${operation} - ${duration}ms`, details);
};

// Logger spécialisé pour la base de données
const logDatabase = (query, duration, error = null) => {
  if (error) {
    log('error', `Erreur base de données: ${query}`, {
      error: error.message,
      duration: `${duration}ms`
    });
  } else {
    log('debug', `Requête DB: ${query} - ${duration}ms`);
  }
};

// Logger pour l'authentification
const logAuth = (action, user, success = true, details = {}) => {
  const level = success ? 'info' : 'warn';
  log(level, `Auth: ${action} - ${user} - ${success ? 'Succès' : 'Échec'}`, details);
};

module.exports = {
  log,
  requestLogger,
  errorLogger,
  logEvent,
  logPerformance,
  logDatabase,
  logAuth
};