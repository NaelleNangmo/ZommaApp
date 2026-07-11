const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

// Get all sales
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, p.name as product_name, p.unit, d.name as depot_name, u.name as vendeur_name
      FROM sales s
      LEFT JOIN products p ON s.product_id = p.id
      LEFT JOIN depots d ON s.depot_id = d.id
      LEFT JOIN users u ON s.vendeur_id = u.id
      ORDER BY s.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new sale
router.post('/', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { productId, depotId, vendeurId, quantity, unitPrice } = req.body;
    const totalAmount = quantity * unitPrice;
    
    // Insert sale
    const saleResult = await client.query(
      'INSERT INTO sales (product_id, depot_id, vendeur_id, quantity, unit_price, total_amount) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [productId, depotId, vendeurId, quantity, unitPrice, totalAmount]
    );
    
    // Update stock
    await client.query(
      'UPDATE stocks SET quantity = quantity - $1, last_updated = CURRENT_TIMESTAMP WHERE product_id = $2 AND depot_id = $3',
      [quantity, productId, depotId]
    );
    
    await client.query('COMMIT');
    res.status(201).json(saleResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating sale:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

module.exports = router;