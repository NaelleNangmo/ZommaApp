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

    if (!fournisseurId || !depotId || !livreurId || !scheduledDate) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Champs obligatoires manquants (fournisseurId, depotId, livreurId, scheduledDate)' });
    }

    // Normaliser items: peut etre un tableau ou un objet {0:{...}, 1:{...}}
    let itemsArray = [];
    if (Array.isArray(items)) {
      itemsArray = items;
    } else if (items && typeof items === 'object') {
      itemsArray = Object.values(items);
    }

    if (itemsArray.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Au moins un produit est requis' });
    }

    const livraisonResult = await client.query(
      'INSERT INTO livraisons (fournisseur_id, depot_id, livreur_id, scheduled_date, total_amount) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [fournisseurId, depotId, livreurId, scheduledDate, totalAmount || 0]
    );
    const livraisonId = livraisonResult.rows[0].id;

    for (const item of itemsArray) {
      if (!item.productId || !item.quantity || !item.unitPrice) continue;
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
    res.status(500).json({ error: error.message || 'Internal server error' });
  } finally {
    client.release();
  }
});

// Update livraison status
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Statut requis' });
    }

    let query;
    if (status === 'completed') {
      query = 'UPDATE livraisons SET status = $1, updated_at = CURRENT_TIMESTAMP, completed_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *';
    } else {
      query = 'UPDATE livraisons SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *';
    }

    const result = await pool.query(query, [status, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Livraison not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating livraison:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

module.exports = router;
