const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const config = require('../config/env');
const { logAuth, logDatabase } = require('../middleware/logging');
const { isValidEmail } = require('../middleware/validation');

const router = express.Router();

// Endpoint de connexion
router.post('/login', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { email, password } = req.body;

    // Validation des données d'entrée
    if (!email || !password) {
      logAuth('LOGIN_ATTEMPT', email || 'unknown', false, { reason: 'Missing credentials' });
      return res.status(400).json({ 
        error: 'Email et mot de passe requis',
        code: 'MISSING_CREDENTIALS'
      });
    }

    if (!isValidEmail(email)) {
      logAuth('LOGIN_ATTEMPT', email, false, { reason: 'Invalid email format' });
      return res.status(400).json({ 
        error: 'Format d\'email invalide',
        code: 'INVALID_EMAIL_FORMAT'
      });
    }

    // Recherche de l'utilisateur par email
    const queryStart = Date.now();
    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email.toLowerCase()]
    );
    logDatabase('SELECT user by email', Date.now() - queryStart);

    if (userResult.rows.length === 0) {
      logAuth('LOGIN_ATTEMPT', email, false, { reason: 'User not found' });
      return res.status(401).json({ 
        error: 'Identifiants invalides',
        code: 'INVALID_CREDENTIALS'
      });
    }

    const user = userResult.rows[0];

    // Vérification du mot de passe
    const passwordStart = Date.now();
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    const passwordDuration = Date.now() - passwordStart;

    if (!isValidPassword) {
      logAuth('LOGIN_ATTEMPT', email, false, { 
        reason: 'Invalid password',
        passwordCheckDuration: `${passwordDuration}ms`
      });
      return res.status(401).json({ 
        error: 'Identifiants invalides',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Génération du token JWT
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      depotId: user.depot_id,
      name: user.name
    };

    const token = jwt.sign(
      tokenPayload,
      config.jwt.secret,
      { 
        expiresIn: config.jwt.expiresIn,
        issuer: 'zoma-sarl-api',
        audience: 'zoma-sarl-frontend'
      }
    );

    // Mise à jour de la dernière connexion
    const updateStart = Date.now();
    await pool.query(
      'UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );
    logDatabase('UPDATE last login', Date.now() - updateStart);

    // Préparation des données utilisateur (sans le mot de passe)
    const { password_hash, ...userData } = user;
    const responseUser = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      depotId: userData.depot_id,
      isActive: userData.is_active,
      createdAt: userData.created_at
    };

    const totalDuration = Date.now() - startTime;
    
    logAuth('LOGIN_SUCCESS', email, true, {
      userId: user.id,
      role: user.role,
      depotId: user.depot_id,
      duration: `${totalDuration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      user: responseUser,
      token,
      expiresIn: config.jwt.expiresIn,
      tokenType: 'Bearer'
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    logAuth('LOGIN_ERROR', req.body.email || 'unknown', false, {
      error: error.message,
      duration: `${duration}ms`,
      ip: req.ip
    });
    
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

// Endpoint de vérification du token
router.post('/verify', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        error: 'Token requis',
        code: 'MISSING_TOKEN'
      });
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Vérifier que l'utilisateur existe toujours et est actif
    const userResult = await pool.query(
      'SELECT id, email, name, role, depot_id, is_active, created_at FROM users WHERE id = $1 AND is_active = true',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ 
        error: 'Utilisateur non trouvé ou inactif',
        code: 'USER_NOT_FOUND'
      });
    }

    const user = userResult.rows[0];
    
    res.json({
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        depotId: user.depot_id,
        isActive: user.is_active,
        createdAt: user.created_at
      },
      tokenInfo: {
        issuedAt: new Date(decoded.iat * 1000),
        expiresAt: new Date(decoded.exp * 1000)
      }
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Token invalide',
        code: 'INVALID_TOKEN'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expiré',
        code: 'TOKEN_EXPIRED'
      });
    }

    console.error('Erreur lors de la vérification du token:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

// Endpoint de déconnexion (optionnel, pour les logs)
router.post('/logout', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      logAuth('LOGOUT', decoded.email, true, {
        userId: decoded.userId,
        ip: req.ip
      });
    } catch (error) {
      // Token invalide, mais on peut quand même logger la tentative
      logAuth('LOGOUT_ATTEMPT', 'unknown', false, {
        reason: 'Invalid token',
        ip: req.ip
      });
    }
  }

  res.json({ 
    message: 'Déconnexion réussie',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;