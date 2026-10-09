-- =============================================================
-- Despensa+ — Schema DDL
-- Base de Datos PostgreSQL para Sistema de Control de Stock
-- Comedor Comunitario "Manos que Alimentan"
-- Versión: 1.0.0
-- =============================================================

-- Limpiar si existe (para re-ejecuciones en desarrollo)
DROP TABLE IF EXISTS "DetalleSalida"    CASCADE;
DROP TABLE IF EXISTS "DetalleDonacion"  CASCADE;
DROP TABLE IF EXISTS "Salida"           CASCADE;
DROP TABLE IF EXISTS "Donacion"         CASCADE;
DROP TABLE IF EXISTS "Producto"         CASCADE;
DROP TABLE IF EXISTS "Usuario"          CASCADE;

-- Tipos ENUM
DROP TYPE IF EXISTS rol_usuario;
DROP TYPE IF EXISTS motivo_salida;
DROP TYPE IF EXISTS estado_producto;
DROP TYPE IF EXISTS unidad_medida;

CREATE TYPE rol_usuario     AS ENUM ('admin', 'operador');
CREATE TYPE motivo_salida   AS ENUM ('Vianda', 'Merienda', 'Otro');
CREATE TYPE estado_producto AS ENUM ('activo', 'inactivo');
CREATE TYPE unidad_medida   AS ENUM ('kg', 'litros', 'unidades', 'paquetes', 'cajas');

-- =============================================================
-- Tabla 1: Usuario
-- =============================================================
CREATE TABLE "Usuario" (
  id_usuario      SERIAL        PRIMARY KEY,
  nombre          VARCHAR(120)  NOT NULL,
  email           VARCHAR(200)  NOT NULL UNIQUE,
  password_hash   VARCHAR(255)  NOT NULL,
  rol             rol_usuario   NOT NULL DEFAULT 'operador',
  fecha_creacion  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- =============================================================
-- Tabla 2: Producto
-- =============================================================
CREATE TABLE "Producto" (
  id_producto    SERIAL         PRIMARY KEY,
  nombre         VARCHAR(150)   NOT NULL,
  categoria      VARCHAR(100)   NOT NULL,
  unidad         unidad_medida  NOT NULL,
  stock_actual   NUMERIC(10,2)  NOT NULL DEFAULT 0,
  stock_minimo   NUMERIC(10,2)  NOT NULL DEFAULT 0,
  estado         estado_producto NOT NULL DEFAULT 'activo',
  CONSTRAINT chk_stock_actual   CHECK (stock_actual  >= 0),
  CONSTRAINT chk_stock_minimo   CHECK (stock_minimo  >= 0)
);

-- =============================================================
-- Tabla 3: Donacion (cabecera)
-- =============================================================
CREATE TABLE "Donacion" (
  id_donacion    SERIAL        PRIMARY KEY,
  fecha          DATE          NOT NULL DEFAULT CURRENT_DATE,
  donante        VARCHAR(200),
  observaciones  TEXT,
  id_usuario     INT           NOT NULL REFERENCES "Usuario"(id_usuario) ON DELETE RESTRICT
);

-- =============================================================
-- Tabla 4: DetalleDonacion (líneas de la donación + movimiento de stock)
-- =============================================================
CREATE TABLE "DetalleDonacion" (
  id_detalle        SERIAL   PRIMARY KEY,
  id_donacion       INT      NOT NULL REFERENCES "Donacion"(id_donacion) ON DELETE CASCADE,
  id_producto       INT      NOT NULL REFERENCES "Producto"(id_producto)  ON DELETE RESTRICT,
  cantidad          NUMERIC(10,2) NOT NULL,
  fecha_vencimiento DATE,
  CONSTRAINT chk_cantidad_donacion CHECK (cantidad > 0)
);

-- =============================================================
-- Tabla 5: Salida (cabecera)
-- =============================================================
CREATE TABLE "Salida" (
  id_salida      SERIAL        PRIMARY KEY,
  fecha          DATE          NOT NULL DEFAULT CURRENT_DATE,
  motivo         motivo_salida NOT NULL,
  observaciones  TEXT,
  id_usuario     INT           NOT NULL REFERENCES "Usuario"(id_usuario) ON DELETE RESTRICT
);

-- =============================================================
-- Tabla 6: DetalleSalida (líneas de la salida + movimiento de stock)
-- =============================================================
CREATE TABLE "DetalleSalida" (
  id_detalle   SERIAL   PRIMARY KEY,
  id_salida    INT      NOT NULL REFERENCES "Salida"(id_salida)   ON DELETE CASCADE,
  id_producto  INT      NOT NULL REFERENCES "Producto"(id_producto) ON DELETE RESTRICT,
  cantidad     NUMERIC(10,2) NOT NULL,
  CONSTRAINT chk_cantidad_salida CHECK (cantidad > 0)
);

-- =============================================================
-- Índices de performance
-- =============================================================
CREATE INDEX idx_detalle_donacion_id     ON "DetalleDonacion"(id_donacion);
CREATE INDEX idx_detalle_donacion_prod   ON "DetalleDonacion"(id_producto);
CREATE INDEX idx_detalle_salida_id       ON "DetalleSalida"(id_salida);
CREATE INDEX idx_detalle_salida_prod     ON "DetalleSalida"(id_producto);
CREATE INDEX idx_donacion_usuario        ON "Donacion"(id_usuario);
CREATE INDEX idx_salida_usuario          ON "Salida"(id_usuario);
CREATE INDEX idx_producto_estado         ON "Producto"(estado);
