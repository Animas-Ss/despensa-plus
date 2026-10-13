import { Router } from 'express';
import {
  crearSalida,
  listarSalidas,
  obtenerSalida,
} from '../controllers/salidaController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

// Protegido con JWT
router.use(authMiddleware);

// GET  /api/salidas     — Listado de salidas registradas
router.get('/', listarSalidas);

// GET  /api/salidas/:id — Detalle de una salida
router.get('/:id', obtenerSalida);

// POST /api/salidas     — Registro transaccional de salida + descuento de stock
router.post('/', crearSalida);

export default router;
