-- =============================================================
-- Despensa+ — Seed de Datos Iniciales
-- NOTA: Ejecutar DESPUÉS de schema.sql
-- Password 'admin123' hasheado con bcrypt (rounds=10)
-- =============================================================

-- Usuario Administrador inicial
-- email: admin@despensaplus.com / contraseña: admin123
INSERT INTO "Usuario" (nombre, email, password_hash, rol)
VALUES (
  'Administrador',
  'admin@despensaplus.com',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'admin'
);

-- =============================================================
-- Productos de ejemplo (stock inicial en 0)
-- =============================================================
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
