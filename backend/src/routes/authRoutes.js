import { Router } from 'express';
import { login, obtenerPerfil } from '../controllers/authController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

// POST /api/auth/login — pública
router.post('/login', login);

// GET /api/auth/me — protegida con JWT
router.get('/me', authMiddleware, obtenerPerfil);

export default router;
