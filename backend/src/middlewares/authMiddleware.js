import jwt from 'jsonwebtoken';

/**
 * Middleware de autenticación JWT.
 * Verifica el header Authorization: Bearer <token>.
 * Si el token es válido, inyecta req.usuario con los datos del payload.
 * Si es inválido o está ausente, responde 401 Unauthorized.
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'No autorizado',
      message: 'Se requiere token de autenticación (Authorization: Bearer <token>)',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload; // { id_usuario, email, rol, nombre }
    next();
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError'
        ? 'El token ha expirado. Iniciá sesión nuevamente.'
        : 'Token inválido o mal formado.';

    return res.status(401).json({ error: 'No autorizado', message });
  }
};

export default authMiddleware;
