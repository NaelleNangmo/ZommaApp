const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

// Get all depots
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM depots ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching depots:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get depot by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM depots WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Depot not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching depot:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new depot
router.post('/', async (req, res) => {
  try {
    const { name, address, phone, adminId } = req.body;
    // adminId doit être un UUID valide ou null
    const safeAdminId = adminId && adminId.trim() !== '' ? adminId : null;
    
    const result = await pool.query(
      'INSERT INTO depots (name, address, phone, admin_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, address, phone, safeAdminId]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating depot:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Update depot
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, phone, adminId, isActive } = req.body;
    // adminId doit être un UUID valide ou null
    const safeAdminId = adminId && adminId.trim() !== '' ? adminId : null;
    
    const result = await pool.query(
      'UPDATE depots SET name = $1, address = $2, phone = $3, admin_id = $4, is_active = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [name, address, phone, safeAdminId, isActive, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Depot not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating depot:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Delete depot (soft delete si des utilisateurs/stocks sont liés)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const refs = await pool.query(
      'SELECT (SELECT COUNT(*) FROM users WHERE depot_id=$1) + (SELECT COUNT(*) FROM stocks WHERE depot_id=$1) AS total',
      [id]
    );
    const hasRefs = parseInt(refs.rows[0].total) > 0;

    let result;
    if (hasRefs) {
      result = await pool.query(
        'UPDATE depots SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
        [id]
      );
    } else {
      result = await pool.query('DELETE FROM depots WHERE id = $1 RETURNING *', [id]);
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Depot not found' });
    }

    res.json({ message: hasRefs ? 'Dépôt désactivé (références existantes)' : 'Dépôt supprimé' });
  } catch (error) {
    console.error('Error deleting depot:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;