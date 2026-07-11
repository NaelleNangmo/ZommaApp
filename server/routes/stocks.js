const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

// Get all stocks
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, p.name as product_name, p.unit, p.seuil_stock, p.prix_achat, d.name as depot_name
      FROM stocks s
      LEFT JOIN products p ON s.product_id = p.id
      LEFT JOIN depots d ON s.depot_id = d.id
      ORDER BY s.last_updated DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching stocks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get stock by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT s.*, p.name as product_name, p.unit, p.seuil_stock, p.prix_achat, d.name as depot_name
      FROM stocks s
      LEFT JOIN products p ON s.product_id = p.id
      LEFT JOIN depots d ON s.depot_id = d.id
      WHERE s.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Stock not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching stock:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update stock
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    
    const result = await pool.query(
      'UPDATE stocks SET quantity = $1, last_updated = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [quantity, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Stock not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;