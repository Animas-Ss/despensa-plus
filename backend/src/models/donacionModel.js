import pool from '../config/db.js';

/**
 * Registra una donación completa de manera atómica (Transacción SQL).
 * Inserta la cabecera en "Donacion", cada línea en "DetalleDonacion",
 * e incrementa el stock_actual de cada producto correspondiente.
 * 
 * Si cualquier paso falla, ejecuta ROLLBACK para garantizar la integridad referencial y de stock.
 * 
 * @param {object} params
 * @param {string} params.fecha - Formato YYYY-MM-DD (o fecha actual si no se provee)
 * @param {string} [params.donante] - Nombre de la persona o institución donante
 * @param {string} [params.observaciones] - Comentarios adicionales
 * @param {number} params.id_usuario - ID del usuario operador/admin autenticado
 * @param {Array<{id_producto: number, cantidad: number, fecha_vencimiento?: string}>} params.detalles
 */
export const crearDonacion = async ({ fecha, donante, observaciones, id_usuario, detalles }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Insertar cabecera de la Donación
    const fechaDonacion = fecha ? new Date(fecha) : new Date();
    const donacionResult = await client.query(
      `INSERT INTO "Donacion" (fecha, donante, observaciones, id_usuario)
       VALUES ($1, $2, $3, $4)
       RETURNING id_donacion, fecha, donante, observaciones, id_usuario`,
      [fechaDonacion, donante ? donante.trim() : null, observaciones ? observaciones.trim() : null, id_usuario]
    );

    const nuevaDonacion = donacionResult.rows[0];
    const detallesInsertados = [];

    // 2. Insertar cada detalle y actualizar el stock del producto
    for (const item of detalles) {
      const { id_producto, cantidad, fecha_vencimiento } = item;
      const cantNum = Number(cantidad);

      if (isNaN(cantNum) || cantNum <= 0) {
        throw new Error(`Cantidad inválida (${cantidad}) para el producto ID ${id_producto}. Debe ser mayor a 0.`);
      }

      // Verificar que el producto exista y esté activo
      const prodCheck = await client.query(
        'SELECT id_producto, nombre, unidad, stock_actual, estado FROM "Producto" WHERE id_producto = $1',
        [id_producto]
      );

      if (prodCheck.rowCount === 0) {
        throw new Error(`El producto con ID ${id_producto} no existe en el catálogo.`);
      }

      const prod = prodCheck.rows[0];
      if (prod.estado !== 'activo') {
        throw new Error(`El producto "${prod.nombre}" (ID ${id_producto}) está inactivo y no puede recibir donaciones.`);
      }

      // Insertar DetalleDonacion
      const fechaVenc = fecha_vencimiento ? new Date(fecha_vencimiento) : null;
      const detalleResult = await client.query(
        `INSERT INTO "DetalleDonacion" (id_donacion, id_producto, cantidad, fecha_vencimiento)
         VALUES ($1, $2, $3, $4)
         RETURNING id_detalle, id_donacion, id_producto, cantidad, fecha_vencimiento`,
        [nuevaDonacion.id_donacion, id_producto, cantNum, fechaVenc]
      );

      // Incrementar stock_actual del producto
      const updateProdResult = await client.query(
        `UPDATE "Producto"
         SET stock_actual = stock_actual + $1
         WHERE id_producto = $2
         RETURNING id_producto, nombre, stock_actual, stock_minimo`,
        [cantNum, id_producto]
      );

      detallesInsertados.push({
        ...detalleResult.rows[0],
        producto_nombre: prod.nombre,
        producto_unidad: prod.unidad,
        nuevo_stock: updateProdResult.rows[0].stock_actual,
      });
    }

    await client.query('COMMIT');

    return {
      ...nuevaDonacion,
      detalles: detallesInsertados,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Retorna el listado de donaciones con información agregada de productos y usuario.
 */
export const listarDonaciones = async ({ limite = 50, offset = 0 } = {}) => {
  const query = `
    SELECT 
      d.id_donacion,
      d.fecha,
      d.donante,
      d.observaciones,
      u.nombre AS usuario_nombre,
      COUNT(dd.id_detalle)::INT AS cantidad_items,
      COALESCE(SUM(dd.cantidad), 0)::NUMERIC(10,2) AS total_unidades
    FROM "Donacion" d
    INNER JOIN "Usuario" u ON d.id_usuario = u.id_usuario
    LEFT JOIN "DetalleDonacion" dd ON d.id_donacion = dd.id_donacion
    GROUP BY d.id_donacion, u.nombre
    ORDER BY d.fecha DESC, d.id_donacion DESC
    LIMIT $1 OFFSET $2
  `;
  const result = await pool.query(query, [limite, offset]);
  return result.rows;
};

/**
 * Retorna una donación completa por ID incluyendo todos sus detalles de productos.
 */
export const findById = async (id_donacion) => {
  const queryCabecera = `
    SELECT 
      d.id_donacion,
      d.fecha,
      d.donante,
      d.observaciones,
      u.id_usuario,
      u.nombre AS usuario_nombre,
      u.email AS usuario_email
    FROM "Donacion" d
    INNER JOIN "Usuario" u ON d.id_usuario = u.id_usuario
    WHERE d.id_donacion = $1
  `;
  const cabeceraResult = await pool.query(queryCabecera, [id_donacion]);
  if (cabeceraResult.rowCount === 0) return null;

  const queryDetalles = `
    SELECT 
      dd.id_detalle,
      dd.id_producto,
      p.nombre AS producto_nombre,
      p.categoria AS producto_categoria,
      p.unidad AS producto_unidad,
      dd.cantidad,
      dd.fecha_vencimiento
    FROM "DetalleDonacion" dd
    INNER JOIN "Producto" p ON dd.id_producto = p.id_producto
    WHERE dd.id_donacion = $1
    ORDER BY dd.id_detalle ASC
  `;
  const detallesResult = await pool.query(queryDetalles, [id_donacion]);

  return {
    ...cabeceraResult.rows[0],
    detalles: detallesResult.rows,
  };
};
