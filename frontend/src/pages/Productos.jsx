import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import ModalProducto from '../components/ModalProducto';

const BADGE = {
  activo:   'bg-emerald-100 text-emerald-700',
  inactivo: 'bg-slate-100 text-slate-500',
};

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [busqueda, setBusqueda]   = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [productoEdit, setProductoEdit] = useState(null); // null = crear nuevo

  const cargarProductos = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/api/productos');
      setProductos(data.productos);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar el catálogo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargarProductos(); }, [cargarProductos]);

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.categoria.toLowerCase().includes(busqueda.toLowerCase())
  );

  const abrirCrear = () => { setProductoEdit(null); setModalOpen(true); };
  const abrirEditar = (p) => { setProductoEdit(p); setModalOpen(true); };
  const cerrarModal = () => setModalOpen(false);

  const onGuardado = () => {
    cerrarModal();
    cargarProductos();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

      {/* Título */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">📦 Catálogo de Productos</h1>
          <p className="text-sm text-slate-500 mt-0.5">Gestioná el inventario de productos del comedor.</p>
        </div>
        <button
          id="btn-nuevo-producto"
          onClick={abrirCrear}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm
                     px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2"
        >
          + Nuevo Producto
        </button>
      </div>

      {/* Buscador */}
      <div className="mb-5">
        <input
          id="buscador-productos"
          type="search"
          placeholder="Buscar por nombre o categoría..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full sm:max-w-sm border border-slate-300 rounded-lg px-4 py-2.5 text-sm
                     focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
        />
      </div>

      {/* Estado de carga / error */}
      {loading && (
        <div className="text-center py-16 text-slate-500 animate-pulse">Cargando catálogo...</div>
      )}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-5 py-4 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Tabla */}
      {!loading && !error && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-xs tracking-wider">
              <tr>
                <th className="text-left px-5 py-3">Producto</th>
                <th className="text-left px-5 py-3 hidden sm:table-cell">Categoría</th>
                <th className="text-left px-5 py-3 hidden md:table-cell">Unidad</th>
                <th className="text-right px-5 py-3">Stock</th>
                <th className="text-right px-5 py-3 hidden sm:table-cell">Mínimo</th>
                <th className="text-center px-5 py-3">Estado</th>
                <th className="text-center px-5 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {productosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    {busqueda ? 'No se encontraron resultados.' : 'No hay productos en el catálogo.'}
                  </td>
                </tr>
              ) : (
                productosFiltrados.map((p) => {
                  const stockBajo = Number(p.stock_actual) <= Number(p.stock_minimo);
                  return (
                    <tr key={p.id_producto} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-slate-800">{p.nombre}</td>
                      <td className="px-5 py-3 text-slate-500 hidden sm:table-cell">{p.categoria}</td>
                      <td className="px-5 py-3 text-slate-500 hidden md:table-cell capitalize">{p.unidad}</td>
                      <td className={`px-5 py-3 text-right font-semibold ${stockBajo ? 'text-red-600' : 'text-slate-800'}`}>
                        {Number(p.stock_actual).toFixed(2)}
                        {stockBajo && <span className="ml-1 text-xs">⚠️</span>}
                      </td>
                      <td className="px-5 py-3 text-right text-slate-500 hidden sm:table-cell">
                        {Number(p.stock_minimo).toFixed(2)}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${BADGE[p.estado]}`}>
                          {p.estado}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <button
                          id={`btn-editar-${p.id_producto}`}
                          onClick={() => abrirEditar(p)}
                          className="text-emerald-600 hover:text-emerald-800 font-medium text-xs transition-colors"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Footer de tabla */}
          <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
            {productosFiltrados.length} de {productos.length} productos
          </div>
        </div>
      )}

      {/* Modal Alta/Edición */}
      {modalOpen && (
        <ModalProducto
          producto={productoEdit}
          onGuardado={onGuardado}
          onCancelar={cerrarModal}
        />
      )}
    </div>
  );
}
