import * as Salida from '../models/salidaModel.js';

const MOTIVOS_VALIDOS = ['Vianda', 'Merienda', 'Otro'];

/**
 * POST /api/salidas
 * Body: {
 *   fecha?: string,
 *   motivo: 'Vianda' | 'Merienda' | 'Otro',
 *   observaciones?: string,
 *   detalles: Array<{ id_producto: number, cantidad: number }>
 * }
 */
export const crearSalida = async (req, res) => {
  const { fecha, motivo, observaciones, detalles } = req.body;
  const id_usuario = req.usuario?.id_usuario;

  if (!id_usuario) {
    return res.status(401).json({ error: 'Usuario no autenticado.' });
  }

  // Validación de motivo
  if (!motivo || !MOTIVOS_VALIDOS.includes(motivo)) {
    return res.status(400).json({
      error: 'Validación fallida.',
      message: `El motivo es obligatorio y debe ser uno de: ${MOTIVOS_VALIDOS.join(', ')}.`,
    });
  }

  // Validación de lista de detalles
  if (!Array.isArray(detalles) || detalles.length === 0) {
    return res.status(400).json({
      error: 'Validación fallida.',
      message: 'La salida debe contener al menos un producto en la lista de detalles.',
    });
  }

  // Validación de ítems
  for (let i = 0; i < detalles.length; i++) {
    const item = detalles[i];
    if (!item.id_producto || isNaN(item.id_producto)) {
      return res.status(400).json({
        error: 'Validación fallida.',
        message: `El ítem en posición ${i + 1} no especifica un id_producto válido.`,
      });
    }

    const cantidad = Number(item.cantidad);
    if (isNaN(cantidad) || cantidad <= 0) {
      return res.status(400).json({
        error: 'Validación fallida.',
        message: `La cantidad para el producto ID ${item.id_producto} debe ser mayor a 0.`,
      });
    }
  }

  try {
    const nuevaSalida = await Salida.crearSalida({
      fecha,
      motivo,
      observaciones,
      id_usuario,
      detalles,
    });

    return res.status(201).json({
      message: 'Salida registrada correctamente y stock descontado.',
      salida: nuevaSalida,
    });
  } catch (err) {
    console.error('crearSalida error:', err.message);

    // Errores de regla de negocio (stock insuficiente, inactivo, no existe)
    if (
      err.message.includes('Stock insuficiente') ||
      err.message.includes('no existe en el catálogo') ||
      err.message.includes('está inactivo') ||
      err.message.includes('Cantidad inválida') ||
      err.message.includes('Motivo inválido')
    ) {
      return res.status(400).json({
        error: 'Error de validación de negocio.',
        message: err.message,
      });
    }

    return res.status(500).json({
      error: 'Error interno del servidor.',
      message: 'No se pudo completar el registro de la salida.',
    });
  }
};

/**
 * GET /api/salidas
 */
export const listarSalidas = async (req, res) => {
  try {
    const limite = Math.min(Number(req.query.limite) || 50, 100);
    const offset = Math.max(Number(req.query.offset) || 0, 0);

    const salidas = await Salida.listarSalidas({ limite, offset });

    return res.status(200).json({
      salidas,
      total: salidas.length,
      limite,
      offset,
    });
  } catch (err) {
    console.error('listarSalidas error:', err);
    return res.status(500).json({ error: 'Error al listar las salidas.' });
  }
};

/**
 * GET /api/salidas/:id
 */
export const obtenerSalida = async (req, res) => {
  const { id } = req.params;

  if (isNaN(id)) {
    return res.status(400).json({ error: 'El ID de la salida debe ser un número entero.' });
  }

  try {
    const salida = await Salida.findById(Number(id));
    if (!salida) {
      return res.status(404).json({ error: `Salida con ID ${id} no encontrada.` });
    }

    return res.status(200).json({ salida });
  } catch (err) {
    console.error('obtenerSalida error:', err);
    return res.status(500).json({ error: 'Error al obtener la salida.' });
  }
};
