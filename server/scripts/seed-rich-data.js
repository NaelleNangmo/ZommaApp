/**
 * Script de peuplement enrichi — génère des ventes, livraisons et stocks
 * sur les 6 derniers mois pour permettre des rapports significatifs.
 */
const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

// ─── IDs connus de la BD ────────────────────────────────────────────────────
const DEPOTS = {
  yaounde:   '5e60d8bc-fec0-48be-bcfd-e95550c3f67d',
  douala:    '8cecbc4a-6053-431b-b3db-c3f7f508df09',
  bafoussam: 'cde1f5a5-9dbd-4366-9549-e0e1662a25e0',
  garoua:    '9b3436a8-a13f-46e3-9607-6426fbdf52ae',
  bamenda:   '5be172f4-df83-4992-8127-4ce6eebd8bec',
};

const PRODUCTS = {
  castel:   '8cca89c6-f11d-4843-94ca-3a62aa634b8b',  // prix_achat 450, prix_vente 650
  eau:      '2489a5f4-026c-4e98-824e-b33e07fb1ba3',  // prix_achat 200, prix_vente 300
  coca:     'e6455bda-57fe-42ed-9c34-af24d99011d1',  // prix_achat 300, prix_vente 450
  export33: '19f142ee-8581-4d0b-be95-e276eff686f4',  // prix_achat 500, prix_vente 700
  guinness: '44e48e3c-2b9a-4ea7-b3a3-bbf4a03749b0',  // prix_achat 600, prix_vente 850
};

const PRIX_VENTE = {
  [PRODUCTS.castel]:   650,
  [PRODUCTS.eau]:      300,
  [PRODUCTS.coca]:     450,
  [PRODUCTS.export33]: 700,
  [PRODUCTS.guinness]: 850,
};

const PRIX_ACHAT = {
  [PRODUCTS.castel]:   450,
  [PRODUCTS.eau]:      200,
  [PRODUCTS.coca]:     300,
  [PRODUCTS.export33]: 500,
  [PRODUCTS.guinness]: 600,
};

const USERS = {
  admin:    '7fcbbd16-b5f4-47ce-9b91-39b8bbdb28db',
  depot1:   'c1fb8271-5c37-4167-9278-2bfbc681d001',
  depot2:   '0ac63569-7cfb-4168-b29f-3592fd3ab6d6',
  vendeur:  'e39e99d4-1b37-45b4-8bce-b01fe80af6a3',
  livreur:  'e7c34b8e-8c88-45af-8fe4-69afef38a28e',
};

const LIVREURS = {
  paul:    '05f834b1-f3ff-46f1-9940-025503db637c',
  sophie:  'd906eff4-e855-464f-85a4-fd2186eaaaab',
  andre:   '69d711bc-058d-4186-b2d7-078d6b0fa0fe',
  marie:   '4932a205-a265-4cf4-8ab4-79e0cae07fe7',
  jean:    'b0636396-9fad-46c2-89e6-640302dcb87f',
};

const FOURNISSEURS = {
  sabc:       '4932813e-1ba2-4b1f-b481-077e79c35904',
  sources:    '3a97c5ad-5491-48aa-81bc-0d3339ac9d73',
  brasseries: 'd9a04f49-a563-4e49-80a3-aaa8a46fac7a',
  coca:       '7e088df1-5c04-46f8-a5e4-d44e6ca9ca52',
  guinness:   '0f3813d5-9a82-4a39-84db-a4d9cbdfbac6',
};

// ─── Helpers ────────────────────────────────────────────────────────────────
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Script principal ────────────────────────────────────────────────────────
async function seedRichData() {
  const client = await pool.connect();
  console.log('🌱 Début du peuplement des données enrichies...\n');

  try {
    await client.query('BEGIN');

    // 1. Supprimer le produit de test CRUD s'il existe
    await client.query("DELETE FROM products WHERE name = 'Test Produit CRUD'");
    console.log('🧹 Nettoyage produit de test CRUD');

    // 2. Stocks enrichis — tous dépôts × tous produits
    const stockCombos = [
      [PRODUCTS.castel,   DEPOTS.yaounde,   120],
      [PRODUCTS.eau,      DEPOTS.yaounde,   300],
      [PRODUCTS.coca,     DEPOTS.yaounde,   85],
      [PRODUCTS.export33, DEPOTS.yaounde,   95],
      [PRODUCTS.guinness, DEPOTS.yaounde,   60],
      [PRODUCTS.castel,   DEPOTS.douala,    80],
      [PRODUCTS.eau,      DEPOTS.douala,    200],
      [PRODUCTS.coca,     DEPOTS.douala,    110],
      [PRODUCTS.export33, DEPOTS.douala,    70],
      [PRODUCTS.guinness, DEPOTS.douala,    45],
      [PRODUCTS.castel,   DEPOTS.bafoussam, 55],
      [PRODUCTS.eau,      DEPOTS.bafoussam, 150],
      [PRODUCTS.coca,     DEPOTS.bafoussam, 30],  // stock faible (seuil 75)
      [PRODUCTS.castel,   DEPOTS.garoua,    25],  // stock faible (seuil 50)
      [PRODUCTS.eau,      DEPOTS.garoua,    90],
      [PRODUCTS.castel,   DEPOTS.bamenda,   40],
      [PRODUCTS.coca,     DEPOTS.bamenda,   50],
    ];

    for (const [pid, did, qty] of stockCombos) {
      await client.query(
        `INSERT INTO stocks (product_id, depot_id, quantity)
         VALUES ($1, $2, $3)
         ON CONFLICT (product_id, depot_id) DO UPDATE SET quantity = $3, last_updated = NOW()`,
        [pid, did, qty]
      );
    }
    console.log('✅ Stocks mis à jour');

    // 3. Ventes — 180 transactions sur 6 mois
    const depotVendeurs = [
      { depotId: DEPOTS.yaounde,   vendeurId: USERS.vendeur },
      { depotId: DEPOTS.douala,    vendeurId: USERS.depot2  },
      { depotId: DEPOTS.bafoussam, vendeurId: USERS.depot1  },
    ];
    const allProducts = Object.values(PRODUCTS);
    let salesCount = 0;

    for (let day = 180; day >= 1; day--) {
      const numSales = rand(1, 4);
      for (let s = 0; s < numSales; s++) {
        const dv = pick(depotVendeurs);
        const pid = pick(allProducts);
        const qty = rand(6, 48);
        const price = PRIX_VENTE[pid];
        const total = qty * price;
        const saleDate = daysAgo(day);

        await client.query(
          `INSERT INTO sales (product_id, depot_id, vendeur_id, quantity, unit_price, total_amount, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [pid, dv.depotId, dv.vendeurId, qty, price, total, saleDate]
        );
        salesCount++;
      }
    }
    console.log(`✅ ${salesCount} ventes créées sur 6 mois`);

    // 4. Livraisons — 30 sur les 3 derniers mois
    const livraisonConfigs = [
      { fournisseurId: FOURNISSEURS.sabc,       depotId: DEPOTS.yaounde,   livreurId: LIVREURS.paul,   productId: PRODUCTS.castel   },
      { fournisseurId: FOURNISSEURS.sources,    depotId: DEPOTS.yaounde,   livreurId: LIVREURS.sophie, productId: PRODUCTS.eau      },
      { fournisseurId: FOURNISSEURS.coca,        depotId: DEPOTS.douala,    livreurId: LIVREURS.andre,  productId: PRODUCTS.coca     },
      { fournisseurId: FOURNISSEURS.brasseries, depotId: DEPOTS.douala,    livreurId: LIVREURS.marie,  productId: PRODUCTS.export33 },
      { fournisseurId: FOURNISSEURS.guinness,   depotId: DEPOTS.bafoussam, livreurId: LIVREURS.jean,   productId: PRODUCTS.guinness },
    ];

    const statuses = ['completed', 'completed', 'completed', 'in_progress', 'pending'];

    for (let i = 0; i < 30; i++) {
      const cfg = pick(livraisonConfigs);
      const daysBack = rand(1, 90);
      const scheduledDate = daysAgo(daysBack);
      const status = pick(statuses);
      const qty = rand(100, 500);
      const unitPrice = PRIX_ACHAT[cfg.productId];
      const total = qty * unitPrice;
      const completedAt = status === 'completed' ? daysAgo(daysBack - 1) : null;

      const livResult = await client.query(
        `INSERT INTO livraisons (fournisseur_id, depot_id, livreur_id, status, scheduled_date, completed_at, total_amount, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
        [cfg.fournisseurId, cfg.depotId, cfg.livreurId, status, scheduledDate, completedAt, total, scheduledDate]
      );

      await client.query(
        `INSERT INTO livraison_items (livraison_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [livResult.rows[0].id, cfg.productId, qty, unitPrice]
      );
    }
    console.log('✅ 30 livraisons créées');

    // 5. Utilisateurs supplémentaires
    const pwHash = await bcrypt.hash('password', 10);
    const extraUsers = [
      ['vendeur2@zoma.com', 'Vendeur Douala',      'vendeur',     DEPOTS.douala],
      ['vendeur3@zoma.com', 'Vendeur Bafoussam',   'vendeur',     DEPOTS.bafoussam],
      ['depot3@zoma.com',   'Admin Dépôt Bafoussam','admin_depot', DEPOTS.bafoussam],
      ['depot4@zoma.com',   'Admin Dépôt Garoua',  'admin_depot', DEPOTS.garoua],
    ];
    for (const [email, name, role, depotId] of extraUsers) {
      await client.query(
        `INSERT INTO users (email, password_hash, name, role, depot_id)
         VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING`,
        [email, pwHash, name, role, depotId]
      );
    }
    console.log('✅ Utilisateurs supplémentaires créés');

    await client.query('COMMIT');
    console.log('\n🎉 Peuplement enrichi terminé avec succès!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Erreur:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seedRichData();
