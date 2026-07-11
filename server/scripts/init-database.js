const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

const initDatabase = async () => {
  try {
    console.log('🔄 Initializing ZOMA SARL database...');

    // Create tables
    await createTables();
    
    // Insert initial data
    await insertInitialData();
    
    console.log('✅ Database initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

const createTables = async () => {
  const client = await pool.connect();
  
  try {
    // Enable UUID extension
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // Depots table
    await client.query(`
      CREATE TABLE IF NOT EXISTS depots (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        phone VARCHAR(20) NOT NULL,
        admin_id UUID,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Fournisseurs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS fournisseurs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        contact VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        fournisseur_id UUID REFERENCES fournisseurs(id),
        unit VARCHAR(50) NOT NULL,
        prix_achat DECIMAL(10,2) NOT NULL,
        prix_vente DECIMAL(10,2) NOT NULL,
        seuil_stock INTEGER NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('admin_global', 'admin_depot', 'vendeur', 'livreur')),
        depot_id UUID REFERENCES depots(id),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Stocks table
    await client.query(`
      CREATE TABLE IF NOT EXISTS stocks (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        product_id UUID REFERENCES products(id),
        depot_id UUID REFERENCES depots(id),
        quantity INTEGER NOT NULL DEFAULT 0,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(product_id, depot_id)
      )
    `);

    // Sales table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sales (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        product_id UUID REFERENCES products(id),
        depot_id UUID REFERENCES depots(id),
        vendeur_id UUID REFERENCES users(id),
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Livreurs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS livreurs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        depot_id UUID REFERENCES depots(id),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Livraisons table
    await client.query(`
      CREATE TABLE IF NOT EXISTS livraisons (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        fournisseur_id UUID REFERENCES fournisseurs(id),
        depot_id UUID REFERENCES depots(id),
        livreur_id UUID REFERENCES livreurs(id),
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
        scheduled_date TIMESTAMP NOT NULL,
        completed_at TIMESTAMP,
        total_amount DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Livraison items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS livraison_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        livraison_id UUID REFERENCES livraisons(id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(id),
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL
      )
    `);

    // Create indexes for better performance
    await client.query('CREATE INDEX IF NOT EXISTS idx_stocks_depot_product ON stocks(depot_id, product_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_sales_depot_date ON sales(depot_id, created_at)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_livraisons_status ON livraisons(status)');

    console.log('✅ Tables created successfully');
  } finally {
    client.release();
  }
};

const insertInitialData = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Insert Fournisseurs
    const fournisseurs = [
      ['SABC', 'Jean Dupont', '+237 222 111 222', 'contact@sabc.cm'],
      ['Sources du Pays', 'Marie Nguyen', '+237 233 333 444', 'info@sourcesdupays.cm'],
      ['Brasseries du Cameroun', 'Paul Mbarga', '+237 244 555 666', 'commercial@bc.cm'],
      ['Coca-Cola Cameroun', 'Sophie Ewondo', '+237 255 777 888', 'ventes@coca-cola.cm'],
      ['Guinness Cameroun', 'André Fouda', '+237 266 999 000', 'distribution@guinness.cm']
    ];

    for (const [name, contact, phone, email] of fournisseurs) {
      await client.query(
        'INSERT INTO fournisseurs (name, contact, phone, email) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING',
        [name, contact, phone, email]
      );
    }

    // Get fournisseur IDs
    const fournisseurResult = await client.query('SELECT id, name FROM fournisseurs ORDER BY created_at');
    const fournisseurMap = {};
    fournisseurResult.rows.forEach(row => {
      fournisseurMap[row.name] = row.id;
    });

    // Insert Depots
    const depots = [
      ['Dépôt Central Yaoundé', '123 Rue de la Réunification, Yaoundé', '+237 222 123 456'],
      ['Dépôt Douala', '456 Boulevard de la Liberté, Douala', '+237 233 654 321'],
      ['Dépôt Bafoussam', '789 Avenue de l\'Indépendance, Bafoussam', '+237 244 789 012'],
      ['Dépôt Garoua', '321 Rue du Commerce, Garoua', '+237 255 345 678'],
      ['Dépôt Bamenda', '654 Commercial Avenue, Bamenda', '+237 266 901 234']
    ];

    for (const [name, address, phone] of depots) {
      await client.query(
        'INSERT INTO depots (name, address, phone) VALUES ($1, $2, $3)',
        [name, address, phone]
      );
    }

    // Get depot IDs
    const depotResult = await client.query('SELECT id, name FROM depots ORDER BY created_at');
    const depotMap = {};
    depotResult.rows.forEach(row => {
      depotMap[row.name] = row.id;
    });

    // Insert Users with hashed passwords
    const passwordHash = await bcrypt.hash('password', 10);
    const users = [
      ['admin@zoma.com', 'Admin Global', 'admin_global', null],
      ['depot1@zoma.com', 'Admin Dépôt Yaoundé', 'admin_depot', depotMap['Dépôt Central Yaoundé']],
      ['vendeur@zoma.com', 'Vendeur Principal', 'vendeur', depotMap['Dépôt Central Yaoundé']],
      ['livreur@zoma.com', 'Livreur Mobile', 'livreur', depotMap['Dépôt Central Yaoundé']],
      ['depot2@zoma.com', 'Admin Dépôt Douala', 'admin_depot', depotMap['Dépôt Douala']]
    ];

    for (const [email, name, role, depotId] of users) {
      await client.query(
        'INSERT INTO users (email, password_hash, name, role, depot_id) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING',
        [email, passwordHash, name, role, depotId]
      );
    }

    // Insert Products
    const products = [
      ['Castel Beer 65cl', fournisseurMap['SABC'], 'bouteille', 450, 650, 50],
      ['Eau Sources du Pays 1.5L', fournisseurMap['Sources du Pays'], 'bouteille', 200, 300, 100],
      ['Coca Cola 50cl', fournisseurMap['Coca-Cola Cameroun'], 'bouteille', 300, 450, 75],
      ['33 Export 65cl', fournisseurMap['Brasseries du Cameroun'], 'bouteille', 500, 700, 40],
      ['Guinness 50cl', fournisseurMap['Guinness Cameroun'], 'bouteille', 600, 850, 30]
    ];

    for (const [name, fournisseurId, unit, prixAchat, prixVente, seuilStock] of products) {
      await client.query(
        'INSERT INTO products (name, fournisseur_id, unit, prix_achat, prix_vente, seuil_stock) VALUES ($1, $2, $3, $4, $5, $6)',
        [name, fournisseurId, unit, prixAchat, prixVente, seuilStock]
      );
    }

    // Get product IDs
    const productResult = await client.query('SELECT id, name FROM products ORDER BY created_at');
    const productMap = {};
    productResult.rows.forEach(row => {
      productMap[row.name] = row.id;
    });

    // Insert Livreurs
    const livreurs = [
      ['Paul Mbarga', '+237 677 123 456', 'paul.mbarga@zoma.com', depotMap['Dépôt Central Yaoundé']],
      ['Sophie Ewondo', '+237 655 987 654', 'sophie.ewondo@zoma.com', depotMap['Dépôt Central Yaoundé']],
      ['André Fouda', '+237 699 111 222', 'andre.fouda@zoma.com', depotMap['Dépôt Douala']],
      ['Marie Nkomo', '+237 677 333 444', 'marie.nkomo@zoma.com', depotMap['Dépôt Douala']],
      ['Jean Talla', '+237 655 555 666', 'jean.talla@zoma.com', depotMap['Dépôt Bafoussam']]
    ];

    for (const [name, phone, email, depotId] of livreurs) {
      await client.query(
        'INSERT INTO livreurs (name, phone, email, depot_id) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING',
        [name, phone, email, depotId]
      );
    }

    // Insert Stocks
    const stocks = [
      [productMap['Castel Beer 65cl'], depotMap['Dépôt Central Yaoundé'], 125],
      [productMap['Eau Sources du Pays 1.5L'], depotMap['Dépôt Central Yaoundé'], 250],
      [productMap['Coca Cola 50cl'], depotMap['Dépôt Central Yaoundé'], 80],
      [productMap['Castel Beer 65cl'], depotMap['Dépôt Douala'], 45],
      [productMap['33 Export 65cl'], depotMap['Dépôt Central Yaoundé'], 90]
    ];

    for (const [productId, depotId, quantity] of stocks) {
      await client.query(
        'INSERT INTO stocks (product_id, depot_id, quantity) VALUES ($1, $2, $3) ON CONFLICT (product_id, depot_id) DO UPDATE SET quantity = $3',
        [productId, depotId, quantity]
      );
    }

    // Get user IDs for sales
    const userResult = await client.query('SELECT id, email FROM users WHERE role IN (\'vendeur\', \'admin_depot\')');
    const vendeurId = userResult.rows.find(u => u.email === 'vendeur@zoma.com')?.id;

    // Insert Sales
    if (vendeurId) {
      const sales = [
        [productMap['Castel Beer 65cl'], depotMap['Dépôt Central Yaoundé'], vendeurId, 24, 650],
        [productMap['Eau Sources du Pays 1.5L'], depotMap['Dépôt Central Yaoundé'], vendeurId, 48, 300],
        [productMap['Coca Cola 50cl'], depotMap['Dépôt Central Yaoundé'], vendeurId, 12, 450],
        [productMap['Castel Beer 65cl'], depotMap['Dépôt Douala'], vendeurId, 36, 650],
        [productMap['33 Export 65cl'], depotMap['Dépôt Central Yaoundé'], vendeurId, 18, 700]
      ];

      for (const [productId, depotId, vendeurId, quantity, unitPrice] of sales) {
        const totalAmount = quantity * unitPrice;
        await client.query(
          'INSERT INTO sales (product_id, depot_id, vendeur_id, quantity, unit_price, total_amount) VALUES ($1, $2, $3, $4, $5, $6)',
          [productId, depotId, vendeurId, quantity, unitPrice, totalAmount]
        );
      }
    }

    await client.query('COMMIT');
    console.log('✅ Initial data inserted successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Run initialization
initDatabase();