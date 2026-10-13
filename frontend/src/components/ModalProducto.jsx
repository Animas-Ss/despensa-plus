import { useState, useEffect } from 'react';
import api from '../services/api';

const UNIDADES = ['kg', 'litros', 'unidades', 'paquetes', 'cajas'];

const CATEGORIAS_SUGERIDAS = [
  'Cereales y granos',
  'Legumbres',
  'Aceites y grasas',
  'Lácteos',
  'Harinas',
  'Endulzantes',
  'Condimentos',
  'Conservas',
  'Infusiones',
  'Limpieza e higiene',
  'Otros',
];

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
      setError('El nombre y la categoría son campos obligatorios.');
      return;
    }
    if (form.stock_minimo !== '' && Number(form.stock_minimo) < 0) {
      setError('El stock mínimo no puede ser un valor negativo.');
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
    <div
      className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onCancelar();
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Modal */}
        <div className="bg-[#0d5945] px-6 sm:px-8 py-5 flex items-center justify-between text-white">
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              {esEdicion ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
            <p className="text-xs text-emerald-100/80 mt-0.5">
              {esEdicion
                ? 'Modificá los datos del producto en el catálogo'
                : 'Ingresá un nuevo artículo para habilitar su stock y donaciones'}
            </p>
          </div>
          <button
            id="btn-cerrar-modal"
            type="button"
            onClick={onCancelar}
            disabled={loading}
            className="text-emerald-100/80 hover:text-white p-1 rounded-lg hover:bg-[#0a4838] transition cursor-pointer"
            aria-label="Cerrar modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          
          {/* Alerta de Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-start gap-2">
              <span className="text-base select-none">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Nombre */}
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-slate-700 mb-1.5">
              Nombre del producto *
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Ej: Fideos Tallarines"
              disabled={loading}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400
                         focus:outline-none focus:border-[#0d825c] focus:ring-1 focus:ring-[#0d825c] transition disabled:bg-slate-50"
            />
          </div>

          {/* Categoría con Datalist de sugerencias */}
          <div>
            <label htmlFor="categoria" className="block text-sm font-medium text-slate-700 mb-1.5">
              Categoría *
            </label>
            <input
              id="categoria"
              name="categoria"
              type="text"
              list="categorias-list"
              value={form.categoria}
              onChange={handleChange}
              placeholder="Ej: Cereales y granos"
              disabled={loading}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400
                         focus:outline-none focus:border-[#0d825c] focus:ring-1 focus:ring-[#0d825c] transition disabled:bg-slate-50"
            />
            <datalist id="categorias-list">
              {CATEGORIAS_SUGERIDAS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          {/* Grilla: Unidad y Stock Mínimo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="unidad" className="block text-sm font-medium text-slate-700 mb-1.5">
                Unidad de medida *
              </label>
              <select
                id="unidad"
                name="unidad"
                value={form.unidad}
                onChange={handleChange}
                disabled={loading}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 bg-white
                           focus:outline-none focus:border-[#0d825c] focus:ring-1 focus:ring-[#0d825c] transition disabled:bg-slate-50 cursor-pointer"
              >
                {UNIDADES.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="stock_minimo" className="block text-sm font-medium text-slate-700 mb-1.5">
                Stock mínimo de alerta
              </label>
              <input
                id="stock_minimo"
                name="stock_minimo"
                type="number"
                min="0"
                step="0.01"
                value={form.stock_minimo}
                onChange={handleChange}
                placeholder="0"
                disabled={loading}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400
                           focus:outline-none focus:border-[#0d825c] focus:ring-1 focus:ring-[#0d825c] transition disabled:bg-slate-50"
              />
            </div>
          </div>

          {/* Estado (solo visible en edición) */}
          {esEdicion && (
            <div>
              <label htmlFor="estado" className="block text-sm font-medium text-slate-700 mb-1.5">
                Estado del producto
              </label>
              <select
                id="estado"
                name="estado"
                value={form.estado}
                onChange={handleChange}
                disabled={loading}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 bg-white
                           focus:outline-none focus:border-[#0d825c] focus:ring-1 focus:ring-[#0d825c] transition disabled:bg-slate-50 cursor-pointer"
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button
              id="btn-cancelar-modal"
              type="button"
              onClick={onCancelar}
              disabled={loading}
              className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50
                         font-semibold py-2.5 rounded-xl text-sm transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              id="btn-guardar-producto"
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#0d825c] hover:bg-[#0a6b4c] disabled:bg-emerald-300
                         text-white font-semibold py-2.5 rounded-xl text-sm transition shadow-sm hover:shadow
                         flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>Guardando...</span>
                </>
              ) : esEdicion ? (
                'Guardar cambios'
              ) : (
                'Crear producto'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
