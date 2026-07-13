const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

const router = express.Router();

// Get all users
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.email, u.name, u.role, u.depot_id, u.is_active, u.created_at, d.name as depot_name
      FROM users u 
      LEFT JOIN depots d ON u.depot_id = d.id 
      ORDER BY u.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT u.id, u.email, u.name, u.role, u.depot_id, u.is_active, u.created_at, d.name as depot_name
      FROM users u 
      LEFT JOIN depots d ON u.depot_id = d.id 
      WHERE u.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new user
router.post('/', async (req, res) => {
  try {
    const { email, password, name, role, depotId } = req.body;
    const safeDepotId = depotId && depotId.trim() !== '' ? depotId : null;
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, name, role, depot_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, role, depot_id, is_active, created_at',
      [email, passwordHash, name, role, safeDepotId]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.code === '23505') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name, role, depotId, isActive } = req.body;
    const safeDepotId = depotId && depotId.trim() !== '' ? depotId : null;
    
    const result = await pool.query(
      'UPDATE users SET email = $1, name = $2, role = $3, depot_id = $4, is_active = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING id, email, name, role, depot_id, is_active, created_at',
      [email, name, role, safeDepotId, isActive, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Delete user (soft delete si des ventes sont liées)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const refs = await pool.query(
      'SELECT COUNT(*) AS total FROM sales WHERE vendeur_id = $1',
      [id]
    );
    const hasRefs = parseInt(refs.rows[0].total) > 0;

    let result;
    if (hasRefs) {
      result = await pool.query(
        'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id',
        [id]
      );
    } else {
      result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: hasRefs ? 'Utilisateur désactivé (historique existant)' : 'Utilisateur supprimé' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;