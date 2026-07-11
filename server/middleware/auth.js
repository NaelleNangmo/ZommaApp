const jwt = require('jsonwebtoken');
const config = require('../config/env');

// Middleware d'authentification JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Token d\'accès requis',
      code: 'MISSING_TOKEN'
    });
  }

  jwt.verify(token, config.jwt.secret, (err, user) => {
    if (err) {
      console.log('❌ Token invalide:', err.message);
      return res.status(403).json({ 
        error: 'Token invalide ou expiré',
        code: 'INVALID_TOKEN'
      });
    }

    req.user = user;
    next();
  });
};

// Middleware de vérification des rôles
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentification requise',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        error: 'Permissions insuffisantes',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: allowedRoles,
        current: userRole
      });
    }

    next();
  };
};

// Middleware pour les admins globaux uniquement
const requireAdminGlobal = requireRole('admin_global');

// Middleware pour les admins (global et dépôt)
const requireAdmin = requireRole(['admin_global', 'admin_depot']);

// Middleware pour les vendeurs et admins
const requireSalesAccess = requireRole(['admin_global', 'admin_depot', 'vendeur']);

// Middleware pour les livreurs et admins
const requireDeliveryAccess = requireRole(['admin_global', 'admin_depot', 'livreur']);

module.exports = {
  authenticateToken,
  requireRole,
  requireAdminGlobal,
  requireAdmin,
  requireSalesAccess,
  requireDeliveryAccess
};