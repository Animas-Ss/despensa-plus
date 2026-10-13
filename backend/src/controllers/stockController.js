import pool from '../config/db.js';

/**
 * GET /api/stock
 * Retorna el inventario de productos enriquecido con:
 * - Próxima fecha de vencimiento registrada (desde DetalleDonacion)
 * - Días restantes para el vencimiento más cercano
 * - Indicador de si está próximo a vencer (<= 30 días)
 * - Estado de stock ('agotado', 'bajo', 'disponible')
 */
export const obtenerInventarioStock = async (req, res) => {
  try {
    const query = `
      SELECT 
        p.id_producto,
        p.nombre,
        p.categoria,
        p.unidad,
        p.stock_actual,
        p.stock_minimo,
        p.estado,
        MIN(dd.fecha_vencimiento) FILTER (WHERE dd.fecha_vencimiento >= CURRENT_DATE) AS proximo_vencimiento,
        MIN(dd.fecha_vencimiento) FILTER (WHERE dd.fecha_vencimiento < CURRENT_DATE)  AS vencimiento_pasado,
        CASE 
          WHEN p.stock_actual = 0 THEN 'agotado'
          WHEN p.stock_actual <= p.stock_minimo THEN 'bajo'
          ELSE 'disponible'
        END AS nivel_stock
      FROM "Producto" p
      LEFT JOIN "DetalleDonacion" dd ON p.id_producto = dd.id_producto
      WHERE p.estado = 'activo'
      GROUP BY p.id_producto
      ORDER BY p.nombre ASC
    `;

    const result = await pool.query(query);

    const inventario = result.rows.map((prod) => {
      let diasRestantes = null;
      let proximoAVencer = false;

      if (prod.proximo_vencimiento) {
        const hoy = new Date();
        const fechaVenc = new Date(prod.proximo_vencimiento);
        const diffMs = fechaVenc.getTime() - hoy.getTime();
        diasRestantes = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        // Próximo a vencer si vence en 30 días o menos
        proximoAVencer = diasRestantes <= 30;
      }

      return {
        ...prod,
        dias_restantes_vencimiento: diasRestantes,
        proximo_a_vencer: proximoAVencer,
      };
    });

    return res.status(200).json({
      stock: inventario,
      total: inventario.length,
    });
  } catch (err) {
    console.error('obtenerInventarioStock error:', err);
    return res.status(500).json({ error: 'Error al consultar inventario de stock.' });
  }
};
