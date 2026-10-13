import pool from '../config/db.js';

const MOTIVOS_VALIDOS = ['Vianda', 'Merienda', 'Otro'];

/**
 * Registra una salida de mercadería con transacción atómica (BEGIN, COMMIT, ROLLBACK).
 * Descuenta el stock_actual de cada producto correspondiente.
 * 
 * Si el stock disponible es menor a la cantidad solicitada para cualquier producto,
 * o si ocurre cualquier error, ejecuta ROLLBACK sin alterar ningún producto.
 * 
 * @param {object} params
 * @param {string} [params.fecha] - Formato YYYY-MM-DD
 * @param {string} params.motivo - 'Vianda' | 'Merienda' | 'Otro'
 * @param {string} [params.observaciones] - Comentarios adicionales
 * @param {number} params.id_usuario - ID del usuario operador/admin autenticado
 * @param {Array<{id_producto: number, cantidad: number}>} params.detalles
 */
export const crearSalida = async ({ fecha, motivo, observaciones, id_usuario, detalles }) => {
  if (!MOTIVOS_VALIDOS.includes(motivo)) {
    throw new Error(`Motivo inválido "${motivo}". Valores permitidos: ${MOTIVOS_VALIDOS.join(', ')}.`);
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Validar disponibilidad de stock de todos los productos (con bloqueo FOR UPDATE)
    for (const item of detalles) {
      const { id_producto, cantidad } = item;
      const cantNum = Number(cantidad);

      if (isNaN(cantNum) || cantNum <= 0) {
        throw new Error(`Cantidad inválida (${cantidad}) para el producto ID ${id_producto}. Debe ser mayor a 0.`);
      }

      const prodCheck = await client.query(
        'SELECT id_producto, nombre, unidad, stock_actual, estado FROM "Producto" WHERE id_producto = $1 FOR UPDATE',
        [id_producto]
      );

      if (prodCheck.rowCount === 0) {
        throw new Error(`El producto con ID ${id_producto} no existe en el catálogo.`);
      }

      const prod = prodCheck.rows[0];
      if (prod.estado !== 'activo') {
        throw new Error(`El producto "${prod.nombre}" está inactivo y no se pueden registrar salidas.`);
      }

      const stockActual = Number(prod.stock_actual);
      if (stockActual < cantNum) {
        throw new Error(
          `Stock insuficiente para "${prod.nombre}". Disponible: ${stockActual} ${prod.unidad}, solicitado: ${cantNum} ${prod.unidad}.`
        );
      }
    }

    // 2. Insertar cabecera de la Salida
    const fechaSalida = fecha ? new Date(fecha) : new Date();
    const salidaResult = await client.query(
      `INSERT INTO "Salida" (fecha, motivo, observaciones, id_usuario)
       VALUES ($1, $2, $3, $4)
       RETURNING id_salida, fecha, motivo, observaciones, id_usuario`,
      [fechaSalida, motivo, observaciones ? observaciones.trim() : null, id_usuario]
    );

    const nuevaSalida = salidaResult.rows[0];
    const detallesInsertados = [];

    // 3. Insertar DetalleSalida y descontar stock_actual
    for (const item of detalles) {
      const { id_producto, cantidad } = item;
      const cantNum = Number(cantidad);

      const detalleResult = await client.query(
        `INSERT INTO "DetalleSalida" (id_salida, id_producto, cantidad)
         VALUES ($1, $2, $3)
         RETURNING id_detalle, id_salida, id_producto, cantidad`,
        [nuevaSalida.id_salida, id_producto, cantNum]
      );

      const updateProdResult = await client.query(
        `UPDATE "Producto"
         SET stock_actual = stock_actual - $1
         WHERE id_producto = $2
         RETURNING id_producto, nombre, unidad, stock_actual, stock_minimo`,
        [cantNum, id_producto]
      );

      const prodActualizado = updateProdResult.rows[0];

      detallesInsertados.push({
        ...detalleResult.rows[0],
        producto_nombre: prodActualizado.nombre,
        producto_unidad: prodActualizado.unidad,
        stock_restante: prodActualizado.stock_actual,
      });
    }

    await client.query('COMMIT');

    return {
      ...nuevaSalida,
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
 * Retorna el listado de salidas con información agregada de productos y usuario.
 */
export const listarSalidas = async ({ limite = 50, offset = 0 } = {}) => {
  const query = `
    SELECT 
      s.id_salida,
      s.fecha,
      s.motivo,
      s.observaciones,
      u.nombre AS usuario_nombre,
      COUNT(ds.id_detalle)::INT AS cantidad_items,
      COALESCE(SUM(ds.cantidad), 0)::NUMERIC(10,2) AS total_unidades
    FROM "Salida" s
    INNER JOIN "Usuario" u ON s.id_usuario = u.id_usuario
    LEFT JOIN "DetalleSalida" ds ON s.id_salida = ds.id_salida
    GROUP BY s.id_salida, u.nombre
    ORDER BY s.fecha DESC, s.id_salida DESC
    LIMIT $1 OFFSET $2
  `;
  const result = await pool.query(query, [limite, offset]);
  return result.rows;
};

/**
 * Retorna una salida completa por ID incluyendo todos sus detalles de productos.
 */
export const findById = async (id_salida) => {
  const queryCabecera = `
    SELECT 
      s.id_salida,
      s.fecha,
      s.motivo,
      s.observaciones,
      u.id_usuario,
      u.nombre AS usuario_nombre,
      u.email AS usuario_email
    FROM "Salida" s
    INNER JOIN "Usuario" u ON s.id_usuario = u.id_usuario
    WHERE s.id_salida = $1
  `;
  const cabeceraResult = await pool.query(queryCabecera, [id_salida]);
  if (cabeceraResult.rowCount === 0) return null;

  const queryDetalles = `
    SELECT 
      ds.id_detalle,
      ds.id_producto,
      p.nombre AS producto_nombre,
      p.categoria AS producto_categoria,
      p.unidad AS producto_unidad,
      ds.cantidad
    FROM "DetalleSalida" ds
    INNER JOIN "Producto" p ON ds.id_producto = p.id_producto
    WHERE ds.id_salida = $1
    ORDER BY ds.id_detalle ASC
  `;
  const detallesResult = await pool.query(queryDetalles, [id_salida]);

  return {
    ...cabeceraResult.rows[0],
    detalles: detallesResult.rows,
  };
};
