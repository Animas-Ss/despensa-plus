-- =============================================================
-- Despensa+ — Seed de Datos Iniciales y Demostración
-- Base de Datos PostgreSQL para Control de Stock y Reportes
-- Comedor Comunitario "Manos que Alimentan"
-- Contraseña unificada para usuarios demo: 'admin123'
-- =============================================================

-- 1. Usuarios del Sistema
INSERT INTO "Usuario" (id_usuario, nombre, email, password_hash, rol) VALUES
  (1, 'Administrador', 'admin@despensaplus.com', '$2b$10$kssQqrvAaeVNOwzFhM6.w.KuVkdrUi3LSTPyXEd3n8LvsLgtCI8Dm', 'admin'),
  (2, 'Lucía Pérez', 'operador@despensaplus.com', '$2b$10$kssQqrvAaeVNOwzFhM6.w.KuVkdrUi3LSTPyXEd3n8LvsLgtCI8Dm', 'operador'),
  (3, 'Marta Gómez', 'cocina@despensaplus.com', '$2b$10$kssQqrvAaeVNOwzFhM6.w.KuVkdrUi3LSTPyXEd3n8LvsLgtCI8Dm', 'operador')
ON CONFLICT (email) DO UPDATE
SET nombre = EXCLUDED.nombre,
    password_hash = EXCLUDED.password_hash,
    rol = EXCLUDED.rol;

SELECT setval(pg_get_serial_sequence('"Usuario"', 'id_usuario'), (SELECT MAX(id_usuario) FROM "Usuario"));

-- 2. Catálogo de Productos
INSERT INTO "Producto" (id_producto, nombre, categoria, unidad, stock_actual, stock_minimo) VALUES
  (1,  'Arroz',             'Cereales y granos',   'kg',       65.00, 5.00),
  (2,  'Fideos',            'Cereales y granos',   'paquetes', 65.00, 10.00),
  (3,  'Lentejas',          'Legumbres',           'kg',       18.00, 3.00),
  (4,  'Garbanzos',         'Legumbres',           'kg',        5.00, 3.00),
  (5,  'Aceite de girasol', 'Aceites y grasas',    'litros',    3.00, 4.00),  -- Alerta de stock crítico (3 < 4)
  (6,  'Leche entera',      'Lácteos',             'litros',   30.00, 10.00),
  (7,  'Harina 000',        'Harinas',             'kg',       60.00, 5.00),
  (8,  'Azúcar',            'Endulzantes',         'kg',        2.00, 3.00),  -- Alerta de stock crítico (2 < 3)
  (9,  'Sal fina',          'Condimentos',         'kg',       13.00, 2.00),
  (10, 'Tomate en lata',    'Conservas',           'unidades', 28.00, 12.00),
  (11, 'Yerba mate',        'Infusiones',          'paquetes', 10.00, 5.00),
  (12, 'Jabón de lavar',    'Limpieza e higiene',  'unidades', 12.00, 6.00),
  (13, 'Polenta',           'Cereales y granos',   'paquetes', 25.00, 6.00),
  (14, 'Atún en lata',      'Conservas',           'unidades', 12.00, 10.00),
  (15, 'Cacao en polvo',    'Infusiones',          'kg',        8.00, 3.00),
  (16, 'Lavandina',         'Limpieza e higiene',  'litros',   10.00, 8.00)
ON CONFLICT (id_producto) DO UPDATE
SET nombre = EXCLUDED.nombre,
    categoria = EXCLUDED.categoria,
    unidad = EXCLUDED.unidad,
    stock_actual = EXCLUDED.stock_actual,
    stock_minimo = EXCLUDED.stock_minimo;

SELECT setval(pg_get_serial_sequence('"Producto"', 'id_producto'), (SELECT MAX(id_producto) FROM "Producto"));

-- 3. Donaciones (Cabecera)
INSERT INTO "Donacion" (id_donacion, fecha, donante, observaciones, id_usuario) VALUES
  (1, CURRENT_DATE - INTERVAL '40 days', 'Banco de Alimentos', 'Envío inicial de insumos secos y legumbres', 1),
  (2, CURRENT_DATE - INTERVAL '35 days', 'Supermercado Mayorista El Sol', 'Campaña solidaria "Alimentos para Crecer"', 2),
  (3, CURRENT_DATE - INTERVAL '28 days', 'Lácteos del Sur S.A.', 'Donación institucional de lácteos y meriendas', 1),
  (4, CURRENT_DATE - INTERVAL '21 days', 'Vecinos Solidarios Barrio Norte', 'Colecta comunitaria barrial de alimentos no perecederos', 2),
  (5, CURRENT_DATE - INTERVAL '15 days', 'Distribuidora San Cayetano', 'Aporte de artículos de higiene y desinfección', 1),
  (6, CURRENT_DATE - INTERVAL '8 days',  'Campaña Parroquial San José', 'Donación semanal de fieles para apoyo alimentario', 3),
  (7, CURRENT_DATE - INTERVAL '2 days',  'Empresa Molinos Central', 'Donación directa de fábrica para el comedor comunitario', 2)
ON CONFLICT (id_donacion) DO NOTHING;

SELECT setval(pg_get_serial_sequence('"Donacion"', 'id_donacion'), (SELECT MAX(id_donacion) FROM "Donacion"));

-- 4. Detalle de Donaciones (Líneas)
INSERT INTO "DetalleDonacion" (id_donacion, id_producto, cantidad, fecha_vencimiento) VALUES
  -- Donación 1
  (1, 1,  50.00, CURRENT_DATE + INTERVAL '240 days'),
  (1, 2,  60.00, CURRENT_DATE + INTERVAL '300 days'),
  (1, 3,  30.00, CURRENT_DATE + INTERVAL '180 days'),
  (1, 4,  20.00, CURRENT_DATE + INTERVAL '210 days'),
  (1, 9,  15.00, CURRENT_DATE + INTERVAL '365 days'),
  -- Donación 2
  (2, 5,  25.00, CURRENT_DATE + INTERVAL '180 days'),
  (2, 7,  40.00, CURRENT_DATE + INTERVAL '150 days'),
  (2, 10, 50.00, CURRENT_DATE + INTERVAL '365 days'),
  (2, 13, 30.00, CURRENT_DATE + INTERVAL '200 days'),
  -- Donación 3
  (3, 6,  60.00, CURRENT_DATE + INTERVAL '45 days'),
  (3, 8,  25.00, CURRENT_DATE + INTERVAL '365 days'),
  (3, 15, 12.00, CURRENT_DATE + INTERVAL '300 days'),
  -- Donación 4
  (4, 1,  20.00, CURRENT_DATE + INTERVAL '240 days'),
  (4, 2,  25.00, CURRENT_DATE + INTERVAL '300 days'),
  (4, 11, 20.00, CURRENT_DATE + INTERVAL '365 days'),
  (4, 14, 36.00, CURRENT_DATE + INTERVAL '400 days'),
  -- Donación 5
  (5, 12, 30.00, CURRENT_DATE + INTERVAL '365 days'),
  (5, 16, 25.00, CURRENT_DATE + INTERVAL '180 days'),
  -- Donación 6
  (6, 6,  30.00, CURRENT_DATE + INTERVAL '60 days'),
  (6, 7,  20.00, CURRENT_DATE + INTERVAL '150 days'),
  (6, 10, 24.00, CURRENT_DATE + INTERVAL '365 days'),
  -- Donación 7
  (7, 1,  30.00, CURRENT_DATE + INTERVAL '240 days'),
  (7, 2,  35.00, CURRENT_DATE + INTERVAL '300 days'),
  (7, 13, 15.00, CURRENT_DATE + INTERVAL '200 days');

-- 5. Salidas (Cabecera)
INSERT INTO "Salida" (id_salida, fecha, motivo, observaciones, id_usuario) VALUES
  (1, CURRENT_DATE - INTERVAL '34 days', 'Vianda',   'Almuerzo comunitario: Guiso de lentejas para 90 comensales', 3),
  (2, CURRENT_DATE - INTERVAL '26 days', 'Merienda', 'Merienda reforzada para niños y adolescentes del barrio', 2),
  (3, CURRENT_DATE - INTERVAL '20 days', 'Vianda',   'Fideos con salsa y albóndigas de legumbres para 100 raciones', 3),
  (4, CURRENT_DATE - INTERVAL '14 days', 'Otro',     'Distribución de kits de higiene y desinfección barrial', 1),
  (5, CURRENT_DATE - INTERVAL '10 days', 'Vianda',   'Pastel de polenta y arroz con atún para 85 raciones', 3),
  (6, CURRENT_DATE - INTERVAL '5 days',  'Merienda', 'Merienda de la tarde y mate cocido comunitario', 2),
  (7, CURRENT_DATE - INTERVAL '1 day',   'Vianda',   'Almuerzo caliente: guiso de fideos y garbanzos para 95 raciones', 3)
ON CONFLICT (id_salida) DO NOTHING;

SELECT setval(pg_get_serial_sequence('"Salida"', 'id_salida'), (SELECT MAX(id_salida) FROM "Salida"));

-- 6. Detalle de Salidas (Líneas)
INSERT INTO "DetalleSalida" (id_salida, id_producto, cantidad) VALUES
  -- Salida 1
  (1, 1,  15.00),
  (1, 3,  12.00),
  (1, 9,   2.00),
  (1, 10, 12.00),
  -- Salida 2
  (2, 6,  25.00),
  (2, 8,   8.00),
  (2, 15,  4.00),
  -- Salida 3
  (3, 2,  25.00),
  (3, 4,   8.00),
  (3, 5,   6.00),
  (3, 10, 16.00),
  -- Salida 4
  (4, 12, 18.00),
  (4, 16, 15.00),
  -- Salida 5
  (5, 1,  20.00),
  (5, 5,   5.00),
  (5, 13, 20.00),
  (5, 14, 24.00),
  -- Salida 6
  (6, 6,  35.00),
  (6, 8,  15.00),
  (6, 11, 10.00),
  -- Salida 7
  (7, 2,  30.00),
  (7, 4,   7.00),
  (7, 5,  11.00),
  (7, 10, 18.00);
