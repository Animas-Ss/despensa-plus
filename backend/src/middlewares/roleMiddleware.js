/**
 * Middleware para restringir acceso exclusivo a Administradores.
 * Debe ejecutarse DESPUÉS de authMiddleware (requiere req.usuario inyectado).
 * OWASP A01: Broken Access Control mitigation.
 */
export const adminOnly = (req, res, next) => {
  if (!req.usuario) {
    return res.status(401).json({
      error: 'No autenticado',
      message: 'Se requiere inicio de sesión para acceder a este recurso.',
    });
  }

  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({
      error: 'Acceso denegado',
      message: 'Se requieren permisos de Administrador para realizar esta acción.',
    });
  }

  next();
};
