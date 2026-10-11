import { Router } from 'express';
import {
  listarProductos,
  obtenerProducto,
  crearProducto,
  actualizarProducto,
} from '../controllers/productoController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

// Todas las rutas de productos requieren autenticación JWT
router.use(authMiddleware);

// GET  /api/productos          — Lista todos (query: ?solo_activos=true)
router.get('/',    listarProductos);

// GET  /api/productos/:id      — Detalle de un producto
router.get('/:id', obtenerProducto);

// POST /api/productos          — Crear nuevo producto
router.post('/',   crearProducto);

// PUT  /api/productos/:id      — Actualizar producto (parcial)
router.put('/:id', actualizarProducto);

export default router;
