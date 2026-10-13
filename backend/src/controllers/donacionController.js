import * as Donacion from '../models/donacionModel.js';

/**
 * POST /api/donaciones
 * Body: {
 *   fecha?: string,
 *   donante?: string,
 *   observaciones?: string,
 *   detalles: Array<{ id_producto: number, cantidad: number, fecha_vencimiento?: string }>
 * }
 */
export const crearDonacion = async (req, res) => {
  const { fecha, donante, observaciones, detalles } = req.body;
  const id_usuario = req.usuario?.id_usuario;

  // Validación de usuario autenticado
  if (!id_usuario) {
    return res.status(401).json({ error: 'Usuario no autenticado.' });
  }

  // Validación de lista de detalles
  if (!Array.isArray(detalles) || detalles.length === 0) {
    return res.status(400).json({
      error: 'Validación fallida.',
      message: 'La donación debe contener al menos un producto en la lista de detalles.',
    });
  }

  // Validación de cada ítem de detalle
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
        message: `La cantidad para el producto ID ${item.id_producto} debe ser un número mayor a 0.`,
      });
    }

    if (item.fecha_vencimiento && isNaN(Date.parse(item.fecha_vencimiento))) {
      return res.status(400).json({
        error: 'Validación fallida.',
        message: `La fecha de vencimiento para el producto ID ${item.id_producto} no es una fecha válida.`,
      });
    }
  }

  try {
    const nuevaDonacion = await Donacion.crearDonacion({
      fecha,
      donante,
      observaciones,
      id_usuario,
      detalles,
    });

    return res.status(201).json({
      message: 'Donación registrada exitosamente y stock actualizado.',
      donacion: nuevaDonacion,
    });
  } catch (err) {
    console.error('crearDonacion error:', err.message);

    // Errores de regla de negocio originados en el modelo (producto no existe, inactivo, etc.)
    if (
      err.message.includes('no existe en el catálogo') ||
      err.message.includes('está inactivo') ||
      err.message.includes('Cantidad inválida')
    ) {
      return res.status(400).json({
        error: 'Error de validación de negocio.',
        message: err.message,
      });
    }

    return res.status(500).json({
      error: 'Error interno del servidor.',
      message: 'No se pudo completar el registro de la donación.',
    });
  }
};

/**
 * GET /api/donaciones
 * Query params: ?limite=50&offset=0
 */
export const listarDonaciones = async (req, res) => {
  try {
    const limite = Math.min(Number(req.query.limite) || 50, 100);
    const offset = Math.max(Number(req.query.offset) || 0, 0);

    const donaciones = await Donacion.listarDonaciones({ limite, offset });

    return res.status(200).json({
      donaciones,
      total: donaciones.length,
      limite,
      offset,
    });
  } catch (err) {
    console.error('listarDonaciones error:', err);
    return res.status(500).json({ error: 'Error al listar las donaciones.' });
  }
};

/**
 * GET /api/donaciones/:id
 */
export const obtenerDonacion = async (req, res) => {
  const { id } = req.params;

  if (isNaN(id)) {
    return res.status(400).json({ error: 'El ID de la donación debe ser un número entero.' });
  }

  try {
    const donacion = await Donacion.findById(Number(id));
    if (!donacion) {
      return res.status(404).json({ error: `Donación con ID ${id} no encontrada.` });
    }

    return res.status(200).json({ donacion });
  } catch (err) {
    console.error('obtenerDonacion error:', err);
    return res.status(500).json({ error: 'Error al obtener la donación.' });
  }
};
