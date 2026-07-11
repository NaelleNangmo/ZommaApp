const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

// Get all livreurs
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT l.*, d.name as depot_name
      FROM livreurs l
      LEFT JOIN depots d ON l.depot_id = d.id
      ORDER BY l.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching livreurs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new livreur
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, depotId } = req.body;
    
    const result = await pool.query(
      'INSERT INTO livreurs (name, phone, email, depot_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, phone, email, depotId]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating livreur:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update livreur
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, depotId, isActive } = req.body;
    
    const result = await pool.query(
      'UPDATE livreurs SET name = $1, phone = $2, email = $3, depot_id = $4, is_active = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [name, phone, email, depotId, isActive, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Livreur not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating livreur:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;