import * as Producto from '../models/productoModel.js';

const UNIDADES_VALIDAS  = ['kg', 'litros', 'unidades', 'paquetes', 'cajas'];
const ESTADOS_VALIDOS   = ['activo', 'inactivo'];

/**
 * GET /api/productos
 * Query param opcional: ?solo_activos=true
 */
export const listarProductos = async (req, res) => {
  try {
    const solo_activos = req.query.solo_activos === 'true';
    const productos = await Producto.findAll({ solo_activos });
    return res.status(200).json({ productos, total: productos.length });
  } catch (err) {
    console.error('listarProductos error:', err);
    return res.status(500).json({ error: 'Error al obtener el catálogo de productos.' });
  }
};

/**
 * GET /api/productos/:id
 */
export const obtenerProducto = async (req, res) => {
  const { id } = req.params;

  if (isNaN(id)) {
    return res.status(400).json({ error: 'El ID debe ser un número entero.' });
  }

  try {
    const producto = await Producto.findById(Number(id));
    if (!producto) {
      return res.status(404).json({ error: `Producto con ID ${id} no encontrado.` });
    }
    return res.status(200).json({ producto });
  } catch (err) {
    console.error('obtenerProducto error:', err);
    return res.status(500).json({ error: 'Error al obtener el producto.' });
  }
};

/**
 * POST /api/productos
 * Body: { nombre, categoria, unidad, stock_actual?, stock_minimo? }
 */
export const crearProducto = async (req, res) => {
  const { nombre, categoria, unidad, stock_actual = 0, stock_minimo = 0 } = req.body;

  // Validaciones de campos obligatorios
  if (!nombre || !categoria || !unidad) {
    return res.status(400).json({
      error: 'Datos incompletos.',
      message: 'Los campos nombre, categoria y unidad son obligatorios.',
    });
  }

  if (!UNIDADES_VALIDAS.includes(unidad)) {
    return res.status(400).json({
      error: 'Unidad inválida.',
      message: `Unidad "${unidad}" no permitida. Valores válidos: ${UNIDADES_VALIDAS.join(', ')}.`,
    });
  }

  if (Number(stock_minimo) < 0) {
    return res.status(400).json({
      error: 'Validación fallida.',
      message: 'El stock_minimo no puede ser negativo.',
    });
  }

  if (Number(stock_actual) < 0) {
    return res.status(400).json({
      error: 'Validación fallida.',
      message: 'El stock_actual no puede ser negativo.',
    });
  }

  try {
    const producto = await Producto.create({ nombre, categoria, unidad, stock_actual, stock_minimo });
    return res.status(201).json({
      message: 'Producto creado correctamente.',
      producto,
    });
  } catch (err) {
    console.error('crearProducto error:', err);
    return res.status(500).json({ error: 'Error al crear el producto.' });
  }
};

/**
 * PUT /api/productos/:id
 * Body: campos a actualizar (parcial) — NO modifica stock_actual directamente.
 */
export const actualizarProducto = async (req, res) => {
  const { id } = req.params;

  if (isNaN(id)) {
    return res.status(400).json({ error: 'El ID debe ser un número entero.' });
  }

  const { nombre, categoria, unidad, stock_minimo, estado } = req.body;

  // Validaciones opcionales
  if (unidad && !UNIDADES_VALIDAS.includes(unidad)) {
    return res.status(400).json({
      error: 'Unidad inválida.',
      message: `Valores válidos: ${UNIDADES_VALIDAS.join(', ')}.`,
    });
  }

  if (estado && !ESTADOS_VALIDOS.includes(estado)) {
    return res.status(400).json({
      error: 'Estado inválido.',
      message: `Valores válidos: ${ESTADOS_VALIDOS.join(', ')}.`,
    });
  }

  if (stock_minimo !== undefined && Number(stock_minimo) < 0) {
    return res.status(400).json({
      error: 'Validación fallida.',
      message: 'El stock_minimo no puede ser negativo.',
    });
  }

  try {
    const producto = await Producto.update(Number(id), { nombre, categoria, unidad, stock_minimo, estado });
    if (!producto) {
      return res.status(404).json({ error: `Producto con ID ${id} no encontrado.` });
    }
    return res.status(200).json({
      message: 'Producto actualizado correctamente.',
      producto,
    });
  } catch (err) {
    console.error('actualizarProducto error:', err);
    return res.status(500).json({ error: 'Error al actualizar el producto.' });
  }
};
