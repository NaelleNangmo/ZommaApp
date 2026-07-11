const { Pool } = require('pg');
const config = require('./env');

const pool = new Pool({
  connectionString: config.database.url,
  ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum de connexions dans le pool
  idleTimeoutMillis: 30000, // Fermer les connexions inactives après 30s
  connectionTimeoutMillis: 2000, // Timeout de connexion de 2s
});

// Test de connexion à la base de données
pool.on('connect', () => {
  console.log('✅ Connexion établie avec PostgreSQL');
  console.log(`📊 Base de données: ${config.database.url.split('@')[1]?.split('/')[1] || 'railway'}`);
});

pool.on('error', (err) => {
  console.error('❌ Erreur de connexion à la base de données:', err.message);
  
  // Tentative de reconnexion automatique
  setTimeout(() => {
    console.log('🔄 Tentative de reconnexion à la base de données...');
  }, 5000);
});

// Fonction pour tester la connexion
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Test de connexion réussi');
    console.log(`⏰ Heure serveur: ${result.rows[0].current_time}`);
    console.log(`🐘 Version PostgreSQL: ${result.rows[0].pg_version.split(' ')[0]} ${result.rows[0].pg_version.split(' ')[1]}`);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Échec du test de connexion:', error.message);
    return false;
  }
};

// Fonction pour fermer proprement le pool
const closePool = async () => {
  try {
    await pool.end();
    console.log('✅ Pool de connexions fermé proprement');
  } catch (error) {
    console.error('❌ Erreur lors de la fermeture du pool:', error.message);
  }
};

// Gestion propre de l'arrêt de l'application
process.on('SIGINT', async () => {
  console.log('\n🛑 Arrêt de l\'application en cours...');
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Arrêt de l\'application demandé...');
  await closePool();
  process.exit(0);
});

module.exports = {
  pool,
  testConnection,
  closePool
};