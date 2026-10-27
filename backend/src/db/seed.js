import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seed() {
  try {
    console.log('🔄 Ejecutando seed.sql...');
    const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf-8');
    await pool.query(seedSql);
    console.log('✅ Datos de prueba sembrados exitosamente.');
  } catch (error) {
    console.error('❌ Error al sembrar datos de prueba:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
