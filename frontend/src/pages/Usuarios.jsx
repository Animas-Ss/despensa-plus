import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ModalUsuario from '../components/ModalUsuario';

export default function Usuarios() {
  const { usuario: usuarioActual } = useAuth();

  const [usuarios, setUsuarios]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [mensajeExito, setMensajeExito] = useState('');

  const [busqueda, setBusqueda]       = useState('');
  const [filtroRol, setFiltroRol]     = useState('todos'); // 'todos' | 'admin' | 'operador'

  const [modalOpen, setModalOpen]     = useState(false);
  const [usuarioEdit, setUsuarioEdit] = useState(null);

  // Estado para confirmación de eliminación
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
  const [eliminando, setEliminando]             = useState(false);

  const cargarUsuarios = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/api/usuarios');
      setUsuarios(data.usuarios || []);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setError(err.response?.data?.message || err.response?.data?.error || 'Error al obtener la lista de usuarios.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  // Filtro de usuarios
  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((u) => {
      const matchTexto =
        u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.email.toLowerCase().includes(busqueda.toLowerCase());
      if (!matchTexto) return false;

      if (filtroRol !== 'todos' && u.rol !== filtroRol) {
        return false;
      }

      return true;
    });
  }, [usuarios, busqueda, filtroRol]);

  const abrirCrear = () => {
    setUsuarioEdit(null);
    setModalOpen(true);
  };

  const abrirEditar = (user) => {
    setUsuarioEdit(user);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
  };

  const onGuardado = () => {
    cerrarModal();
    setMensajeExito(usuarioEdit ? 'Usuario modificado con éxito.' : 'Nuevo usuario registrado correctamente.');
    setTimeout(() => setMensajeExito(''), 4000);
    cargarUsuarios();
  };

  const handleConfirmarEliminar = async () => {
    if (!usuarioAEliminar) return;
    setEliminando(true);
    setError('');

    try {
      const { data } = await api.delete(`/api/usuarios/${usuarioAEliminar.id_usuario}`);
      setMensajeExito(data.message || 'Usuario eliminado correctamente.');
      setUsuarioAEliminar(null);
      setTimeout(() => setMensajeExito(''), 4000);
      cargarUsuarios();
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
      setError(err.response?.data?.message || err.response?.data?.error || 'Error al eliminar usuario.');
      setUsuarioAEliminar(null);
    } finally {
      setEliminando(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6" data-purpose="user-management-view">
      
      {/* ── Encabezado ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Gestión de usuarios
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Administración de cuentas, colaboradores y roles de acceso al sistema.
          </p>
        </div>
        <button
          id="btn-nuevo-usuario"
          type="button"
          onClick={abrirCrear}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0d825c] hover:bg-[#0a6b4c] text-white text-sm font-semibold shadow-xs hover:shadow transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          <span>Nuevo usuario</span>
        </button>
      </div>

      {/* ── Banners de Notificación ──────────────────────────────────── */}
      {mensajeExito && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span>✅</span>
            <span>{mensajeExito}</span>
          </span>
          <button onClick={() => setMensajeExito('')} className="text-emerald-600 hover:text-emerald-800 text-xs font-bold">
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </span>
          <button onClick={() => setError('')} className="text-red-600 hover:text-red-800 text-xs font-bold">
            ✕
          </button>
        </div>
      )}

      {/* ── Filtros y Buscador ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Buscador */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            id="buscador-usuarios"
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o correo electrónico..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-[#0d825c] focus:ring-1 focus:ring-[#0d825c] shadow-xs"
          />
        </div>

        {/* Filtro por Rol */}
        <div className="w-full sm:w-56">
          <select
            id="filtro-rol-usuario"
            value={filtroRol}
            onChange={(e) => setFiltroRol(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-sm text-slate-700 focus:outline-none focus:border-[#0d825c] focus:ring-1 focus:ring-[#0d825c] shadow-xs cursor-pointer"
          >
            <option value="todos">Todos los roles</option>
            <option value="admin">Solo Administradores</option>
            <option value="operador">Solo Operadores</option>
          </select>
        </div>
      </div>

      {/* ── Tabla de Usuarios ───────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Usuarios registrados</h2>
          <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-medium">
            {usuariosFiltrados.length} {usuariosFiltrados.length === 1 ? 'cuenta' : 'cuentas'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="text-xs font-semibold text-slate-500 uppercase border-b border-slate-100 bg-slate-50/60">
              <tr>
                <th scope="col" className="py-4 px-6 font-semibold">Usuario</th>
                <th scope="col" className="py-4 px-6 font-semibold">Rol</th>
                <th scope="col" className="py-4 px-6 font-semibold hidden md:table-cell">Fecha de alta</th>
                <th scope="col" className="py-4 px-6 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="w-6 h-6 border-2 border-emerald-600/20 border-t-emerald-600 rounded-full animate-spin"></span>
                      <span>Cargando usuarios...</span>
                    </div>
                  </td>
                </tr>
              ) : usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    No se encontraron usuarios con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                usuariosFiltrados.map((u) => {
                  const esUsuarioActual = usuarioActual?.id_usuario === u.id_usuario;
                  const esAdmin = u.rol === 'admin';

                  return (
                    <tr key={u.id_usuario} className="hover:bg-slate-50/60 transition">
                      {/* Usuario & Email */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            esAdmin ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {u.nombre.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-2">
                              <span>{u.nombre}</span>
                              {esUsuarioActual && (
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-normal">
                                  Tú
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-400 block">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Rol Badge */}
                      <td className="py-4 px-6">
                        {esAdmin ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                            Administrador
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#e8f7f0] text-[#0d825c] border border-[#a2dfc3]/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0d825c]"></span>
                            Operador
                          </span>
                        )}
                      </td>

                      {/* Fecha de alta */}
                      <td className="py-4 px-6 text-xs text-slate-500 hidden md:table-cell">
                        {u.fecha_creacion ? new Date(u.fecha_creacion).toLocaleDateString('es-AR') : '—'}
                      </td>

                      {/* Acciones */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => abrirEditar(u)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                            title="Editar usuario"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>

                          <button
                            type="button"
                            disabled={esUsuarioActual}
                            onClick={() => setUsuarioAEliminar(u)}
                            className={`p-1.5 rounded-lg transition ${
                              esUsuarioActual
                                ? 'text-slate-200 cursor-not-allowed'
                                : 'text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer'
                            }`}
                            title={esUsuarioActual ? 'No podés eliminar tu propia cuenta' : 'Eliminar usuario'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal Alta/Edición ───────────────────────────────────────── */}
      <ModalUsuario
        isOpen={modalOpen}
        onClose={cerrarModal}
        onGuardado={onGuardado}
        usuarioEdit={usuarioEdit}
      />

      {/* ── Modal de Confirmación de Eliminación ─────────────────────── */}
      {usuarioAEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900">¿Eliminar usuario?</h3>
            <p className="text-sm text-slate-500 mt-2">
              ¿Estás seguro de que deseás eliminar a <strong className="text-slate-800">{usuarioAEliminar.nombre}</strong> ({usuarioAEliminar.email})? Esta acción no se puede deshacer.
            </p>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                disabled={eliminando}
                onClick={() => setUsuarioAEliminar(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={eliminando}
                onClick={handleConfirmarEliminar}
                className="px-5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:bg-red-300 rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
              >
                {eliminando && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>}
                <span>Eliminar usuario</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
