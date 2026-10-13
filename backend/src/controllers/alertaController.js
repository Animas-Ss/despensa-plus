import pool from '../config/db.js';

/**
 * GET /api/alertas
 * Retorna las alertas críticas del comedor:
 * 1. Productos con stock bajo (stock_actual <= stock_minimo)
 * 2. Productos próximos a vencer (vencimiento dentro de los próximos 30 días)
 */
export const obtenerAlertas = async (req, res) => {
  try {
    // 1. Alertas de Stock Bajo
    const queryStockBajo = `
      SELECT 
        id_producto,
        nombre,
        categoria,
        unidad,
        stock_actual,
        stock_minimo,
        CASE 
          WHEN stock_actual = 0 THEN 'agotado'
          ELSE 'critico'
        END AS nivel
      FROM "Producto"
      WHERE estado = 'activo' AND stock_actual <= stock_minimo
      ORDER BY stock_actual ASC, nombre ASC
    `;
    const resStockBajo = await pool.query(queryStockBajo);

    // 2. Alertas de Próximos Vencimientos (dentro de los próximos 30 días)
    const queryVencimientos = `
      SELECT 
        p.id_producto,
        p.nombre,
        p.categoria,
        p.unidad,
        p.stock_actual,
        MIN(dd.fecha_vencimiento) AS fecha_vencimiento,
        (MIN(dd.fecha_vencimiento) - CURRENT_DATE) AS dias_restantes
      FROM "Producto" p
      INNER JOIN "DetalleDonacion" dd ON p.id_producto = dd.id_producto
      WHERE p.estado = 'activo'
        AND p.stock_actual > 0
        AND dd.fecha_vencimiento >= CURRENT_DATE
        AND dd.fecha_vencimiento <= CURRENT_DATE + INTERVAL '30 days'
      GROUP BY p.id_producto
      ORDER BY fecha_vencimiento ASC
    `;
    const resVencimientos = await pool.query(queryVencimientos);

    return res.status(200).json({
      stockBajo: resStockBajo.rows,
      proximosAVencer: resVencimientos.rows,
      resumen: {
        totalStockBajo: resStockBajo.rowCount,
        totalProximosAVencer: resVencimientos.rowCount,
      },
    });
  } catch (err) {
    console.error('obtenerAlertas error:', err);
    return res.status(500).json({ error: 'Error al consultar el sistema de alertas.' });
  }
};
