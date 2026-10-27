import { Router } from 'express';
import {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
} from '../controllers/usuarioController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { adminOnly } from '../middlewares/roleMiddleware.js';

const router = Router();

// Todas las rutas de gestión de usuarios requieren autenticación y rol de Administrador (OWASP A01)
router.use(authMiddleware, adminOnly);

// GET /api/usuarios — Listar usuarios
router.get('/', obtenerUsuarios);

// GET /api/usuarios/:id — Detalle de usuario
router.get('/:id', obtenerUsuarioPorId);

// POST /api/usuarios — Crear usuario
router.post('/', crearUsuario);

// PUT /api/usuarios/:id — Actualizar usuario
router.put('/:id', actualizarUsuario);

// DELETE /api/usuarios/:id — Eliminar usuario
router.delete('/:id', eliminarUsuario);

export default router;
