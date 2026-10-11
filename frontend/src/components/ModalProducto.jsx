import { useState, useEffect } from 'react';
import api from '../services/api';

const UNIDADES = ['kg', 'litros', 'unidades', 'paquetes', 'cajas'];

const FORM_VACIO = {
  nombre:       '',
  categoria:    '',
  unidad:       'kg',
  stock_minimo: '',
  estado:       'activo',
};

export default function ModalProducto({ producto, onGuardado, onCancelar }) {
  const esEdicion = !!producto;
  const [form, setForm]         = useState(FORM_VACIO);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  // Prellenar formulario si es edición
  useEffect(() => {
    if (producto) {
      setForm({
        nombre:       producto.nombre       || '',
        categoria:    producto.categoria    || '',
        unidad:       producto.unidad       || 'kg',
        stock_minimo: producto.stock_minimo !== undefined ? String(producto.stock_minimo) : '',
        estado:       producto.estado       || 'activo',
      });
    } else {
      setForm(FORM_VACIO);
    }
  }, [producto]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.categoria.trim()) {
      setError('El nombre y la categoría son obligatorios.');
      return;
    }
    if (form.stock_minimo !== '' && Number(form.stock_minimo) < 0) {
      setError('El stock mínimo no puede ser negativo.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      if (esEdicion) {
        await api.put(`/api/productos/${producto.id_producto}`, {
          nombre:       form.nombre.trim(),
          categoria:    form.categoria.trim(),
          unidad:       form.unidad,
          stock_minimo: form.stock_minimo !== '' ? Number(form.stock_minimo) : undefined,
          estado:       form.estado,
        });
      } else {
        await api.post('/api/productos', {
          nombre:       form.nombre.trim(),
          categoria:    form.categoria.trim(),
          unidad:       form.unidad,
          stock_minimo: form.stock_minimo !== '' ? Number(form.stock_minimo) : 0,
        });
      }
      onGuardado();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Error al guardar el producto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onCancelar(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="bg-emerald-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-white font-bold text-lg">
            {esEdicion ? '✏️ Editar Producto' : '➕ Nuevo Producto'}
          </h2>
          <button
            id="btn-cerrar-modal"
            onClick={onCancelar}
            className="text-emerald-200 hover:text-white transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5">
              ⚠️ {error}
            </div>
          )}

          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
            <input
              id="nombre" name="nombre" type="text"
              value={form.nombre} onChange={handleChange}
              placeholder="Ej: Arroz"
              disabled={loading}
              className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50"
            />
          </div>

          <div>
            <label htmlFor="categoria" className="block text-sm font-medium text-slate-700 mb-1">Categoría *</label>
            <input
              id="categoria" name="categoria" type="text"
              value={form.categoria} onChange={handleChange}
              placeholder="Ej: Cereales y granos"
              disabled={loading}
              className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="unidad" className="block text-sm font-medium text-slate-700 mb-1">Unidad</label>
              <select
                id="unidad" name="unidad"
                value={form.unidad} onChange={handleChange}
                disabled={loading}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50"
              >
                {UNIDADES.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="stock_minimo" className="block text-sm font-medium text-slate-700 mb-1">Stock Mínimo</label>
              <input
                id="stock_minimo" name="stock_minimo" type="number" min="0" step="0.01"
                value={form.stock_minimo} onChange={handleChange}
                placeholder="0"
                disabled={loading}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50"
              />
            </div>
          </div>

          {esEdicion && (
            <div>
              <label htmlFor="estado" className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
              <select
                id="estado" name="estado"
                value={form.estado} onChange={handleChange}
                disabled={loading}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50"
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          )}

          {/* Acciones */}
          <div className="flex gap-3 pt-2">
            <button
              id="btn-cancelar-modal"
              type="button"
              onClick={onCancelar}
              disabled={loading}
              className="flex-1 border border-slate-300 text-slate-600 hover:bg-slate-50
                         font-medium py-2.5 rounded-lg text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              id="btn-guardar-producto"
              type="submit"
              disabled={loading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400
                         text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
            >
              {loading ? 'Guardando...' : esEdicion ? 'Actualizar' : 'Crear Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
