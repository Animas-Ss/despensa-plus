import { useState, useEffect } from 'react';
import api from '../services/api';

export default function ModalUsuario({ isOpen, onClose, onGuardado, usuarioEdit }) {
  const [nombre, setNombre]     = useState('');
  const [email, setEmail]       = useState('');
  const [rol, setRol]           = useState('operador');
  const [password, setPassword] = useState('');

  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const esEdicion = Boolean(usuarioEdit);

  useEffect(() => {
    if (usuarioEdit) {
      setNombre(usuarioEdit.nombre || '');
      setEmail(usuarioEdit.email || '');
      setRol(usuarioEdit.rol || 'operador');
      setPassword('');
    } else {
      setNombre('');
      setEmail('');
      setRol('operador');
      setPassword('');
    }
    setError('');
  }, [usuarioEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!nombre.trim() || !email.trim()) {
      setError('Por favor completá los campos de nombre y correo electrónico.');
      return;
    }

    if (!esEdicion && (!password || password.length < 6)) {
      setError('La contraseña es obligatoria y debe tener al menos 6 caracteres.');
      return;
    }

    if (esEdicion && password && password.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      if (esEdicion) {
        const payload = {
          nombre: nombre.trim(),
          email: email.trim().toLowerCase(),
          rol,
        };
        if (password.trim() !== '') {
          payload.password = password;
        }
        await api.put(`/api/usuarios/${usuarioEdit.id_usuario}`, payload);
      } else {
        const payload = {
          nombre: nombre.trim(),
          email: email.trim().toLowerCase(),
          rol,
          password,
        };
        await api.post('/api/usuarios', payload);
      }

      onGuardado();
    } catch (err) {
      console.error('Error al guardar usuario:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || 'Error al procesar la solicitud.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 overflow-hidden relative">
        
        {/* Encabezado */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {esEdicion ? 'Editar usuario' : 'Nuevo usuario'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {esEdicion
                ? 'Modificá los datos, rol o restablecé la contraseña del colaborador.'
                : 'Asigná credenciales de acceso para un voluntario o administrador.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition cursor-pointer"
            aria-label="Cerrar modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Alerta de Error */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
            <span className="shrink-0 text-base">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Nombre */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5" htmlFor="user-nombre">
              Nombre completo *
            </label>
            <input
              id="user-nombre"
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Lucía Pérez"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-[#0d825c] focus:ring-1 focus:ring-[#0d825c] transition outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5" htmlFor="user-email">
              Correo electrónico *
            </label>
            <input
              id="user-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ej: lucia@despensaplus.com"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-[#0d825c] focus:ring-1 focus:ring-[#0d825c] transition outline-none"
            />
          </div>

          {/* Rol */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5" htmlFor="user-rol">
              Rol en el sistema *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex flex-col p-3 rounded-xl border text-xs cursor-pointer transition ${
                  rol === 'operador'
                    ? 'border-[#0d825c] bg-[#e8f7f0]/40 text-[#0d825c] font-semibold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="rol"
                    value="operador"
                    checked={rol === 'operador'}
                    onChange={() => setRol('operador')}
                    className="accent-[#0d825c]"
                  />
                  <span>Operador</span>
                </div>
                <span className="text-[11px] font-normal text-slate-500 mt-1">
                  Registra donaciones, salidas y consulta reportes.
                </span>
              </label>

              <label
                className={`flex flex-col p-3 rounded-xl border text-xs cursor-pointer transition ${
                  rol === 'admin'
                    ? 'border-amber-500 bg-amber-50/50 text-amber-900 font-semibold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="rol"
                    value="admin"
                    checked={rol === 'admin'}
                    onChange={() => setRol('admin')}
                    className="accent-amber-600"
                  />
                  <span>Administrador</span>
                </div>
                <span className="text-[11px] font-normal text-slate-500 mt-1">
                  Control total, catálogo y gestión de usuarios.
                </span>
              </label>
            </div>
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5" htmlFor="user-password">
              {esEdicion ? 'Nueva contraseña (opcional)' : 'Contraseña *'}
            </label>
            <input
              id="user-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={esEdicion ? 'Dejar en blanco para no cambiarla' : 'Mínimo 6 caracteres'}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-[#0d825c] focus:ring-1 focus:ring-[#0d825c] transition outline-none"
            />
          </div>

          {/* Acciones */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-[#0d825c] hover:bg-[#0a6b4c] disabled:bg-emerald-300 rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
            >
              {loading && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>}
              <span>{esEdicion ? 'Guardar cambios' : 'Crear usuario'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
