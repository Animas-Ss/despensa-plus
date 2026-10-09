import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Pool de conexiones a PostgreSQL
// En producción (Render) usa DATABASE_URL directamente.
// En desarrollo local usa las variables individuales o DATABASE_URL del .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // En Render/Supabase/Neon con SSL habilitado:
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
});

// Verificación de conectividad al iniciar
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error al conectar con PostgreSQL:', err.message);
    return;
  }
  client.query('SELECT NOW()', (queryErr, result) => {
    release();
    if (queryErr) {
      console.error('❌ Error en consulta de verificación:', queryErr.message);
    } else {
      console.log(`✅ PostgreSQL conectado — ${result.rows[0].now}`);
    }
  });
});

export default pool;
