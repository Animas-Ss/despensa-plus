import { Router } from 'express';
import { obtenerInventarioStock } from '../controllers/stockController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

// Protegido con JWT
router.use(authMiddleware);

// GET /api/stock — Inventario consolidado con vencimientos
router.get('/', obtenerInventarioStock);

export default router;
