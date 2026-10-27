import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

/**
 * GET /api/usuarios
 * Lista todos los usuarios (solo admin)
 */
export const obtenerUsuarios = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id_usuario, nombre, email, rol, fecha_creacion FROM "Usuario" ORDER BY id_usuario ASC'
    );
    return res.status(200).json({ usuarios: result.rows, total: result.rowCount });
  } catch (err) {
    console.error('obtenerUsuarios error:', err);
    return res.status(500).json({ error: 'Error al consultar lista de usuarios.' });
  }
};

/**
 * GET /api/usuarios/:id
 * Obtiene un usuario por ID (solo admin)
 */
export const obtenerUsuarioPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT id_usuario, nombre, email, rol, fecha_creacion FROM "Usuario" WHERE id_usuario = $1',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    return res.status(200).json({ usuario: result.rows[0] });
  } catch (err) {
    console.error('obtenerUsuarioPorId error:', err);
    return res.status(500).json({ error: 'Error al consultar usuario.' });
  }
};

/**
 * POST /api/usuarios
 * Da de alta un nuevo usuario (solo admin)
 * Body: { nombre, email, password, rol }
 */
export const crearUsuario = async (req, res) => {
  const { nombre, email, password, rol = 'operador' } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({
      error: 'Datos incompletos',
      message: 'Los campos nombre, email y password son obligatorios.',
    });
  }

  const emailNorm = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailNorm)) {
    return res.status(400).json({
      error: 'Formato inválido',
      message: 'El correo electrónico ingresado no tiene un formato válido.',
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      error: 'Contraseña débil',
      message: 'La contraseña debe tener al menos 6 caracteres.',
    });
  }

  if (!['admin', 'operador'].includes(rol)) {
    return res.status(400).json({
      error: 'Rol inválido',
      message: 'El rol debe ser "admin" u "operador".',
    });
  }

  try {
    // Verificar si el email ya existe
    const existCheck = await pool.query('SELECT id_usuario FROM "Usuario" WHERE email = $1', [emailNorm]);
    if (existCheck.rowCount > 0) {
      return res.status(409).json({
        error: 'Email duplicado',
        message: 'Ya existe un usuario registrado con ese correo electrónico.',
      });
    }

    // Hashear contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    const insertRes = await pool.query(
      `INSERT INTO "Usuario" (nombre, email, password_hash, rol)
       VALUES ($1, $2, $3, $4)
       RETURNING id_usuario, nombre, email, rol, fecha_creacion`,
      [nombre.trim(), emailNorm, passwordHash, rol]
    );

    return res.status(201).json({
      message: 'Usuario creado exitosamente.',
      usuario: insertRes.rows[0],
    });
  } catch (err) {
    console.error('crearUsuario error:', err);
    return res.status(500).json({ error: 'Error interno al registrar usuario.' });
  }
};

/**
 * PUT /api/usuarios/:id
 * Actualiza nombre, email, rol y opcionalmente password (solo admin)
 * Body: { nombre, email, rol, password? }
 */
export const actualizarUsuario = async (req, res) => {
  const { id } = req.params;
  const { nombre, email, rol, password } = req.body;

  try {
    // Verificar existencia del usuario
    const userRes = await pool.query('SELECT id_usuario, rol FROM "Usuario" WHERE id_usuario = $1', [id]);
    if (userRes.rowCount === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // Validar email si fue provisto
    let emailNorm = undefined;
    if (email) {
      emailNorm = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailNorm)) {
        return res.status(400).json({
          error: 'Formato inválido',
          message: 'El correo electrónico ingresado no tiene un formato válido.',
        });
      }

      const dupCheck = await pool.query(
        'SELECT id_usuario FROM "Usuario" WHERE email = $1 AND id_usuario != $2',
        [emailNorm, id]
      );
      if (dupCheck.rowCount > 0) {
        return res.status(409).json({
          error: 'Email duplicado',
          message: 'El correo electrónico ya pertenece a otro usuario.',
        });
      }
    }

    // Validar rol si fue provisto
    if (rol && !['admin', 'operador'].includes(rol)) {
      return res.status(400).json({
        error: 'Rol inválido',
        message: 'El rol debe ser "admin" u "operador".',
      });
    }

    // Si intenta quitarse el rol de admin a sí mismo
    if (Number(id) === req.usuario.id_usuario && rol && rol !== 'admin') {
      return res.status(400).json({
        error: 'Operación no permitida',
        message: 'No podés remover tu propio rol de Administrador mientras estás en sesión.',
      });
    }

    // Actualización dinámica
    const updates = [];
    const values = [];
    let idx = 1;

    if (nombre) {
      updates.push(`nombre = $${idx++}`);
      values.push(nombre.trim());
    }
    if (emailNorm) {
      updates.push(`email = $${idx++}`);
      values.push(emailNorm);
    }
    if (rol) {
      updates.push(`rol = $${idx++}`);
      values.push(rol);
    }
    if (password && password.trim() !== '') {
      if (password.length < 6) {
        return res.status(400).json({
          error: 'Contraseña débil',
          message: 'La nueva contraseña debe tener al menos 6 caracteres.',
        });
      }
      const hash = await bcrypt.hash(password, 10);
      updates.push(`password_hash = $${idx++}`);
      values.push(hash);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No se enviaron campos para actualizar.' });
    }

    values.push(id);
    const query = `
      UPDATE "Usuario"
      SET ${updates.join(', ')}
      WHERE id_usuario = $${idx}
      RETURNING id_usuario, nombre, email, rol, fecha_creacion
    `;

    const updateRes = await pool.query(query, values);

    return res.status(200).json({
      message: 'Usuario actualizado exitosamente.',
      usuario: updateRes.rows[0],
    });
  } catch (err) {
    console.error('actualizarUsuario error:', err);
    return res.status(500).json({ error: 'Error al actualizar el usuario.' });
  }
};

/**
 * DELETE /api/usuarios/:id
 * Elimina un usuario (solo admin)
 */
export const eliminarUsuario = async (req, res) => {
  const { id } = req.params;

  // 1. Salvaguarda: No permitir que el admin se elimine a sí mismo
  if (Number(id) === req.usuario.id_usuario) {
    return res.status(400).json({
      error: 'Operación no permitida',
      message: 'No podés eliminar tu propia cuenta de Administrador en uso.',
    });
  }

  try {
    // 2. Verificar existencia
    const userRes = await pool.query('SELECT nombre, email FROM "Usuario" WHERE id_usuario = $1', [id]);
    if (userRes.rowCount === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // 3. Verificar si tiene donaciones o salidas registradas (Integridad Referencial)
    const donacionesCheck = await pool.query('SELECT 1 FROM "Donacion" WHERE id_usuario = $1 LIMIT 1', [id]);
    const salidasCheck = await pool.query('SELECT 1 FROM "Salida" WHERE id_usuario = $1 LIMIT 1', [id]);

    if (donacionesCheck.rowCount > 0 || salidasCheck.rowCount > 0) {
      return res.status(400).json({
        error: 'Restricción de integridad',
        message: 'No es posible eliminar un usuario con registros históricos de donaciones o salidas vinculados por motivos de rendición de cuentas y auditoría.',
      });
    }

    // 4. Eliminar
    await pool.query('DELETE FROM "Usuario" WHERE id_usuario = $1', [id]);

    return res.status(200).json({
      message: `El usuario "${userRes.rows[0].nombre}" fue eliminado correctamente.`,
      id_usuario: Number(id),
    });
  } catch (err) {
    if (err.code === '23503') { // foreign key violation fallback
      return res.status(400).json({
        error: 'Restricción de integridad',
        message: 'No es posible eliminar el usuario debido a registros históricos asociados.',
      });
    }
    console.error('eliminarUsuario error:', err);
    return res.status(500).json({ error: 'Error al eliminar usuario.' });
  }
};
