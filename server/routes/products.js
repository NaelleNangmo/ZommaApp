const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, f.name as fournisseur_name 
      FROM products p 
      LEFT JOIN fournisseurs f ON p.fournisseur_id = f.id 
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT p.*, f.name as fournisseur_name 
      FROM products p 
      LEFT JOIN fournisseurs f ON p.fournisseur_id = f.id 
      WHERE p.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new product
router.post('/', async (req, res) => {
  try {
    const { name, fournisseurId, unit, prixAchat, prixVente, seuilStock } = req.body;
    
    const result = await pool.query(
      'INSERT INTO products (name, fournisseur_id, unit, prix_achat, prix_vente, seuil_stock) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, fournisseurId, unit, prixAchat, prixVente, seuilStock]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, fournisseurId, unit, prixAchat, prixVente, seuilStock, isActive } = req.body;
    
    const result = await pool.query(
      'UPDATE products SET name = $1, fournisseur_id = $2, unit = $3, prix_achat = $4, prix_vente = $5, seuil_stock = $6, is_active = $7, updated_at = CURRENT_TIMESTAMP WHERE id = $8 RETURNING *',
      [name, fournisseurId, unit, prixAchat, prixVente, seuilStock, isActive, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete product (soft delete — désactivation si des références existent)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si le produit a des stocks ou ventes
    const refs = await pool.query(
      'SELECT (SELECT COUNT(*) FROM stocks WHERE product_id=$1) + (SELECT COUNT(*) FROM sales WHERE product_id=$1) AS total',
      [id]
    );
    const hasRefs = parseInt(refs.rows[0].total) > 0;

    let result;
    if (hasRefs) {
      // Soft delete : désactiver au lieu de supprimer
      result = await pool.query(
        'UPDATE products SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
        [id]
      );
    } else {
      result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: hasRefs ? 'Produit désactivé (références existantes)' : 'Produit supprimé' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;