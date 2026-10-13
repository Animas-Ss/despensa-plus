import { Router } from 'express';
import {
  obtenerResumenPeriodo,
  obtenerMovimientos,
} from '../controllers/reporteController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

// Protegido con JWT
router.use(authMiddleware);

// GET /api/reportes/resumen     — Métricas consolidadas del período
router.get('/resumen', obtenerResumenPeriodo);

// GET /api/reportes/movimientos — Listado cronológico de entradas y salidas
router.get('/movimientos', obtenerMovimientos);

export default router;
