import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDb() {
  try {
    console.log('🔄 Ejecutando schema.sql (Estructura DDL)...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await pool.query(schemaSql);
    console.log('✅ Esquema DDL creado con éxito.');

    console.log('🔄 Sembrando datos iniciales y lote de prueba (seed.sql)...');
    const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf-8');
    await pool.query(seedSql);
    console.log('✅ Base de datos sembrada con éxito:');
    console.log('   - 3 usuarios (1 admin, 2 operadores con credencial "admin123")');
    console.log('   - 16 productos con stock y puntos de reorden mínimos');
    console.log('   - 7 donaciones históricas con detalle');
    console.log('   - 7 salidas históricas con detalle y motivo');
    console.log('   - Stock de almacén sincronizado para reportes y alertas.');
  } catch (error) {
    console.error('❌ Error al inicializar base de datos:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDb();
