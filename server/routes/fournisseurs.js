const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

// Get all fournisseurs
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM fournisseurs ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching fournisseurs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get fournisseur by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM fournisseurs WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Fournisseur not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching fournisseur:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new fournisseur
router.post('/', async (req, res) => {
  try {
    const { name, contact, phone, email } = req.body;
    
    const result = await pool.query(
      'INSERT INTO fournisseurs (name, contact, phone, email) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, contact, phone, email]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating fournisseur:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update fournisseur
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact, phone, email, isActive } = req.body;
    
    const result = await pool.query(
      'UPDATE fournisseurs SET name = $1, contact = $2, phone = $3, email = $4, is_active = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [name, contact, phone, email, isActive, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Fournisseur not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating fournisseur:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete fournisseur (soft delete si des produits sont liés)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const refs = await pool.query(
      'SELECT COUNT(*) AS total FROM products WHERE fournisseur_id = $1',
      [id]
    );
    const hasRefs = parseInt(refs.rows[0].total) > 0;

    let result;
    if (hasRefs) {
      result = await pool.query(
        'UPDATE fournisseurs SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
        [id]
      );
    } else {
      result = await pool.query('DELETE FROM fournisseurs WHERE id = $1 RETURNING *', [id]);
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Fournisseur not found' });
    }

    res.json({ message: hasRefs ? 'Fournisseur désactivé (produits liés)' : 'Fournisseur supprimé' });
  } catch (error) {
    console.error('Error deleting fournisseur:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;