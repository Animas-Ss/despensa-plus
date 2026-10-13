import { Router } from 'express';
import {
  crearDonacion,
  listarDonaciones,
  obtenerDonacion,
} from '../controllers/donacionController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

// Todas las rutas de donaciones requieren autenticación JWT
router.use(authMiddleware);

// GET  /api/donaciones     — Listado de donaciones registradas
router.get('/', listarDonaciones);

// GET  /api/donaciones/:id — Detalle de una donación con sus productos
router.get('/:id', obtenerDonacion);

// POST /api/donaciones     — Registro transaccional de nueva donación + incremento de stock
router.post('/', crearDonacion);

export default router;
