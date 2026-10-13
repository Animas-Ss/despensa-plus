import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const isProduction = process.env.NODE_ENV === 'production';

// Configuración de conexión según el entorno
const poolConfig = isProduction
  ? {
    // Producción: Render
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  }
  : {
    // Desarrollo local: PostgreSQL en Docker
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME || 'despensa_dev',
    user: process.env.DB_USER || 'despensa_user',
    password: process.env.DB_PASSWORD,
    ssl: false,
  };

const pool = new Pool(poolConfig);

// Manejo de errores inesperados del pool
pool.on('error', (err) => {
  console.error('❌ Error inesperado en PostgreSQL:', err.message);
});

// Verificar la conexión al iniciar
async function checkConnection() {
  let client;

  try {
    client = await pool.connect();

    const result = await client.query('SELECT NOW() AS server_time');

    console.log(
      `✅ PostgreSQL conectado — ${result.rows[0].server_time}`
    );

  } catch (err) {
    console.error('❌ Error al conectar con PostgreSQL:', err.message);
  } finally {
    client?.release();
  }
}

checkConnection();

export default pool;