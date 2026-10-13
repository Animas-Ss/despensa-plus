import { Router } from 'express';
import { obtenerAlertas } from '../controllers/alertaController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

// Protegido con JWT
router.use(authMiddleware);

// GET /api/alertas — Listado de alertas de stock bajo y vencimientos
router.get('/', obtenerAlertas);

export default router;
