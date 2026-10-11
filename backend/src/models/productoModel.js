import pool from '../config/db.js';

/**
 * Retorna todos los productos activos o todos según filtro.
 * @param {object} filtros - { solo_activos: boolean }
 */
export const findAll = async ({ solo_activos = false } = {}) => {
  const query = solo_activos
    ? 'SELECT * FROM "Producto" WHERE estado = \'activo\' ORDER BY nombre ASC'
    : 'SELECT * FROM "Producto" ORDER BY nombre ASC';
  const result = await pool.query(query);
  return result.rows;
};

/**
 * Retorna un producto por su ID.
 */
export const findById = async (id_producto) => {
  const result = await pool.query(
    'SELECT * FROM "Producto" WHERE id_producto = $1',
    [id_producto]
  );
  return result.rows[0] || null;
};

/**
 * Inserta un nuevo producto. Retorna el registro creado.
 */
export const create = async ({ nombre, categoria, unidad, stock_actual = 0, stock_minimo = 0 }) => {
  const result = await pool.query(
    `INSERT INTO "Producto" (nombre, categoria, unidad, stock_actual, stock_minimo)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [nombre.trim(), categoria.trim(), unidad, Number(stock_actual), Number(stock_minimo)]
  );
  return result.rows[0];
};

/**
 * Actualiza los campos de un producto. Retorna el registro actualizado.
 */
export const update = async (id_producto, campos) => {
  const { nombre, categoria, unidad, stock_minimo, estado } = campos;
  const result = await pool.query(
    `UPDATE "Producto"
     SET nombre       = COALESCE($1, nombre),
         categoria    = COALESCE($2, categoria),
         unidad       = COALESCE($3::unidad_medida, unidad),
         stock_minimo = COALESCE($4, stock_minimo),
         estado       = COALESCE($5::estado_producto, estado)
     WHERE id_producto = $6
     RETURNING *`,
    [
      nombre     ? nombre.trim()    : null,
      categoria  ? categoria.trim() : null,
      unidad     || null,
      stock_minimo !== undefined ? Number(stock_minimo) : null,
      estado     || null,
      id_producto,
    ]
  );
  return result.rows[0] || null;
};
