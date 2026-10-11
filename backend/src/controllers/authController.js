import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

// Duración del token: 8 horas
const JWT_EXPIRES_IN = '8h';

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Responde con JWT + datos básicos del usuario autenticado.
 */
export const login = async (req, res) => {
  const { email, password } = req.body;

  // Validación de campos obligatorios
  if (!email || !password) {
    return res.status(400).json({
      error: 'Datos incompletos',
      message: 'Los campos email y password son obligatorios.',
    });
  }

  try {
    // Buscar usuario por email
    const result = await pool.query(
      'SELECT id_usuario, nombre, email, password_hash, rol FROM "Usuario" WHERE email = $1',
      [email.trim().toLowerCase()]
    );

    if (result.rowCount === 0) {
      // No revelar si el email existe o no (seguridad OWASP A07)
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Email o contraseña incorrectos.',
      });
    }

    const usuario = result.rows[0];

    // Verificar contraseña con bcrypt
    const passwordValida = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValida) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Email o contraseña incorrectos.',
      });
    }

    // Emitir JWT
    const payload = {
      id_usuario: usuario.id_usuario,
      nombre:     usuario.nombre,
      email:      usuario.email,
      rol:        usuario.rol,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    return res.status(200).json({
      message: 'Sesión iniciada correctamente.',
      token,
      usuario: payload,
    });
  } catch (err) {
    console.error('Error en login:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/**
 * GET /api/auth/me
 * Requiere header Authorization: Bearer <token>
 * Retorna el perfil completo del usuario autenticado desde la BD.
 */
export const obtenerPerfil = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id_usuario, nombre, email, rol, fecha_creacion FROM "Usuario" WHERE id_usuario = $1',
      [req.usuario.id_usuario]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    return res.status(200).json({ usuario: result.rows[0] });
  } catch (err) {
    console.error('Error en obtenerPerfil:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};
