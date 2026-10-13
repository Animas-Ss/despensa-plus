import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDb() {
  try {
    console.log('🔄 Ejecutando schema.sql...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await pool.query(schemaSql);
    console.log('✅ Esquema DDL creado con éxito.');

    console.log('🔄 Sembrando datos iniciales...');
    const passwordHash = await bcrypt.hash('admin123', 10);

    await pool.query(`
      INSERT INTO "Usuario" (nombre, email, password_hash, rol)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO UPDATE 
      SET password_hash = EXCLUDED.password_hash;
    `, ['Administrador', 'admin@despensaplus.com', passwordHash, 'admin']);

    await pool.query(`
      INSERT INTO "Producto" (nombre, categoria, unidad, stock_actual, stock_minimo) VALUES
        ('Arroz',           'Cereales y granos',   'kg',       0, 5),
        ('Fideos',          'Cereales y granos',   'paquetes', 0, 10),
        ('Lentejas',        'Legumbres',           'kg',       0, 3),
        ('Garbanzos',       'Legumbres',           'kg',       0, 3),
        ('Aceite de girasol','Aceites y grasas',   'litros',   0, 4),
        ('Leche entera',    'Lácteos',             'litros',   0, 10),
        ('Harina 000',      'Harinas',             'kg',       0, 5),
        ('Azúcar',          'Endulzantes',         'kg',       0, 3),
        ('Sal fina',        'Condimentos',         'kg',       0, 2),
        ('Tomate en lata',  'Conservas',           'unidades', 0, 12),
        ('Yerba mate',      'Infusiones',          'paquetes', 0, 5),
        ('Jabón de lavar',  'Limpieza e higiene',  'unidades', 0, 6);
    `);

    console.log('✅ Usuario Administrador (admin@despensaplus.com) y 12 productos sembrados correctamente.');
  } catch (error) {
    console.error('❌ Error al inicializar base de datos:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDb();
