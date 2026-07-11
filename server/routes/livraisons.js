const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

// Get all livraisons
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT l.*, f.name as fournisseur_name, d.name as depot_name, li.name as livreur_name
      FROM livraisons l
      LEFT JOIN fournisseurs f ON l.fournisseur_id = f.id
      LEFT JOIN depots d ON l.depot_id = d.id
      LEFT JOIN livreurs li ON l.livreur_id = li.id
      ORDER BY l.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching livraisons:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new livraison
router.post('/', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { fournisseurId, depotId, livreurId, scheduledDate, items, totalAmount } = req.body;
    
    // Insert livraison
    const livraisonResult = await client.query(
      'INSERT INTO livraisons (fournisseur_id, depot_id, livreur_id, scheduled_date, total_amount) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [fournisseurId, depotId, livreurId, scheduledDate, totalAmount]
    );
    
    const livraisonId = livraisonResult.rows[0].id;
    
    // Insert livraison items
    for (const item of items) {
      await client.query(
        'INSERT INTO livraison_items (livraison_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)',
        [livraisonId, item.productId, item.quantity, item.unitPrice]
      );
    }
    
    await client.query('COMMIT');
    res.status(201).json(livraisonResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating livraison:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// Update livraison status
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const updateFields = ['status = $1', 'updated_at = CURRENT_TIMESTAMP'];
    const values = [status];
    
    if (status === 'completed') {
      updateFields.push('completed_at = CURRENT_TIMESTAMP');
    }
    
    const result = await pool.query(
      `UPDATE livraisons SET ${updateFields.join(', ')} WHERE id = $${values.length + 1} RETURNING *`,
      [...values, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Livraison not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating livraison:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;