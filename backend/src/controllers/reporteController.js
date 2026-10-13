import pool from '../config/db.js';

/**
 * GET /api/reportes/resumen
 * Query params: ?desde=YYYY-MM-DD&hasta=YYYY-MM-DD
 */
export const obtenerResumenPeriodo = async (req, res) => {
  const { desde, hasta } = req.query;

  try {
    const fechaDesde = desde ? new Date(desde) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const fechaHasta = hasta ? new Date(hasta) : new Date();

    // 1. Resumen Donaciones
    const queryDonaciones = `
      SELECT 
        COUNT(DISTINCT d.id_donacion)::INT AS total_donaciones,
        COALESCE(SUM(dd.cantidad), 0)::NUMERIC(10,2) AS unidades_donadas
      FROM "Donacion" d
      LEFT JOIN "DetalleDonacion" dd ON d.id_donacion = dd.id_donacion
      WHERE d.fecha >= $1 AND d.fecha <= $2
    `;
    const resDonaciones = await pool.query(queryDonaciones, [fechaDesde, fechaHasta]);

    // 2. Resumen Salidas
    const querySalidas = `
      SELECT 
        COUNT(DISTINCT s.id_salida)::INT AS total_salidas,
        COALESCE(SUM(ds.cantidad), 0)::NUMERIC(10,2) AS unidades_salidas
      FROM "Salida" s
      LEFT JOIN "DetalleSalida" ds ON s.id_salida = ds.id_salida
      WHERE s.fecha >= $1 AND s.fecha <= $2
    `;
    const resSalidas = await pool.query(querySalidas, [fechaDesde, fechaHasta]);

    const donaciones = resDonaciones.rows[0];
    const salidas = resSalidas.rows[0];
    const totalProductosMovidos = (
      Number(donaciones.unidades_donadas) + Number(salidas.unidades_salidas)
    ).toFixed(2);

    return res.status(200).json({
      desde: fechaDesde.toISOString().split('T')[0],
      hasta: fechaHasta.toISOString().split('T')[0],
      totalDonaciones: donaciones.total_donaciones,
      unidadesDonadas: donaciones.unidades_donadas,
      totalSalidas: salidas.total_salidas,
      unidadesSalidas: salidas.unidades_salidas,
      totalProductosMovidos,
    });
  } catch (err) {
    console.error('obtenerResumenPeriodo error:', err);
    return res.status(500).json({ error: 'Error al calcular resumen de reportes.' });
  }
};

/**
 * GET /api/reportes/movimientos
 * Query params: ?desde=YYYY-MM-DD&hasta=YYYY-MM-DD&tipo=todos|donaciones|salidas&limite=50
 */
export const obtenerMovimientos = async (req, res) => {
  const { desde, hasta, tipo = 'todos' } = req.query;
  const limite = Math.min(Number(req.query.limite) || 50, 200);

  try {
    const fechaDesde = desde ? new Date(desde) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const fechaHasta = hasta ? new Date(hasta) : new Date();

    const query = `
      SELECT * FROM (
        -- Entradas (Donaciones)
        SELECT 
          d.id_donacion AS id_movimiento,
          d.fecha,
          'Donación' AS tipo,
          p.nombre AS producto,
          p.categoria,
          dd.cantidad,
          p.unidad,
          COALESCE(d.donante, 'Anónimo') AS origen_destino,
          u.nombre AS usuario
        FROM "DetalleDonacion" dd
        INNER JOIN "Donacion" d ON dd.id_donacion = d.id_donacion
        INNER JOIN "Producto" p ON dd.id_producto = p.id_producto
        INNER JOIN "Usuario" u ON d.id_usuario = u.id_usuario
        WHERE ($3 = 'todos' OR $3 = 'donaciones')
          AND d.fecha >= $1 AND d.fecha <= $2

        UNION ALL

        -- Salidas
        SELECT 
          s.id_salida AS id_movimiento,
          s.fecha,
          'Salida' AS tipo,
          p.nombre AS producto,
          p.categoria,
          ds.cantidad,
          p.unidad,
          s.motivo::VARCHAR AS origen_destino,
          u.nombre AS usuario
        FROM "DetalleSalida" ds
        INNER JOIN "Salida" s ON ds.id_salida = s.id_salida
        INNER JOIN "Producto" p ON ds.id_producto = p.id_producto
        INNER JOIN "Usuario" u ON s.id_usuario = u.id_usuario
        WHERE ($3 = 'todos' OR $3 = 'salidas')
          AND s.fecha >= $1 AND s.fecha <= $2
      ) movimientos
      ORDER BY fecha DESC, id_movimiento DESC
      LIMIT $4
    `;

    const result = await pool.query(query, [fechaDesde, fechaHasta, tipo, limite]);

    return res.status(200).json({
      movimientos: result.rows,
      total: result.rowCount,
    });
  } catch (err) {
    console.error('obtenerMovimientos error:', err);
    return res.status(500).json({ error: 'Error al consultar movimientos históricos.' });
  }
};
