const config = require('../config/env');

// Validation des emails
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validation des numéros de téléphone camerounais
const isValidCameroonPhone = (phone) => {
  const phoneRegex = /^\+237[0-9]{9}$/;
  return phoneRegex.test(phone);
};

// Validation des mots de passe
const isValidPassword = (password) => {
  // Au moins 8 caractères, une majuscule, une minuscule, un chiffre
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Validation des montants
const isValidAmount = (amount) => {
  return typeof amount === 'number' && amount >= 0 && amount <= 999999999;
};

// Validation des quantités
const isValidQuantity = (quantity) => {
  return Number.isInteger(quantity) && quantity >= 0 && quantity <= 999999;
};

// Middleware de validation pour la création d'utilisateur
const validateUserCreation = (req, res, next) => {
  const { email, password, name, role, depotId } = req.body;
  const errors = [];

  // Validation email
  if (!email || !isValidEmail(email)) {
    errors.push('Email invalide');
  }

  // Validation mot de passe
  if (!password || !isValidPassword(password)) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre');
  }

  // Validation nom
  if (!name || name.trim().length < 2 || name.trim().length > 100) {
    errors.push('Le nom doit contenir entre 2 et 100 caractères');
  }

  // Validation rôle
  const validRoles = ['admin_global', 'admin_depot', 'vendeur', 'livreur'];
  if (!role || !validRoles.includes(role)) {
    errors.push('Rôle invalide');
  }

  // Validation dépôt pour certains rôles
  if (['admin_depot', 'vendeur', 'livreur'].includes(role) && !depotId) {
    errors.push('ID de dépôt requis pour ce rôle');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Données de validation invalides',
      details: errors
    });
  }

  next();
};

// Middleware de validation pour la création de produit
const validateProductCreation = (req, res, next) => {
  const { name, fournisseurId, unit, prixAchat, prixVente, seuilStock } = req.body;
  const errors = [];

  // Validation nom
  if (!name || name.trim().length < 2 || name.trim().length > 255) {
    errors.push('Le nom du produit doit contenir entre 2 et 255 caractères');
  }

  // Validation fournisseur
  if (!fournisseurId) {
    errors.push('ID fournisseur requis');
  }

  // Validation unité
  if (!unit || unit.trim().length < 1 || unit.trim().length > 50) {
    errors.push('L\'unité doit contenir entre 1 et 50 caractères');
  }

  // Validation prix
  if (!isValidAmount(prixAchat)) {
    errors.push('Prix d\'achat invalide');
  }

  if (!isValidAmount(prixVente)) {
    errors.push('Prix de vente invalide');
  }

  if (prixVente <= prixAchat) {
    errors.push('Le prix de vente doit être supérieur au prix d\'achat');
  }

  // Validation seuil stock
  if (!isValidQuantity(seuilStock)) {
    errors.push('Seuil de stock invalide');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Données de validation invalides',
      details: errors
    });
  }

  next();
};

// Middleware de validation pour la création de vente
const validateSaleCreation = (req, res, next) => {
  const { productId, depotId, vendeurId, quantity, unitPrice } = req.body;
  const errors = [];

  // Validation des IDs
  if (!productId) errors.push('ID produit requis');
  if (!depotId) errors.push('ID dépôt requis');
  if (!vendeurId) errors.push('ID vendeur requis');

  // Validation quantité
  if (!isValidQuantity(quantity) || quantity === 0) {
    errors.push('Quantité invalide (doit être supérieure à 0)');
  }

  // Validation prix unitaire
  if (!isValidAmount(unitPrice) || unitPrice === 0) {
    errors.push('Prix unitaire invalide (doit être supérieur à 0)');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Données de validation invalides',
      details: errors
    });
  }

  next();
};

// Middleware de sanitisation des données
const sanitizeInput = (req, res, next) => {
  // Fonction récursive pour nettoyer les objets
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      return obj.trim();
    }
    if (typeof obj === 'object' && obj !== null) {
      const sanitized = {};
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };

  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);

  next();
};

module.exports = {
  isValidEmail,
  isValidCameroonPhone,
  isValidPassword,
  isValidAmount,
  isValidQuantity,
  validateUserCreation,
  validateProductCreation,
  validateSaleCreation,
  sanitizeInput
};