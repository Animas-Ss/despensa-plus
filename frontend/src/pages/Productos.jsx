import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';
import ModalProducto from '../components/ModalProducto';

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [busqueda, setBusqueda]   = useState('');
  const [categoriaSel, setCategoriaSel] = useState('todas');
  const [filtroEstado, setFiltroEstado] = useState('todos'); // 'todos' | 'bajo' | 'agotado' | 'disponible'
  const [modalOpen, setModalOpen] = useState(false);
  const [productoEdit, setProductoEdit] = useState(null); // null = nuevo

  const cargarProductos = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/api/stock');
      setProductos(data.stock || data.productos || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar el inventario de stock.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarProductos();
  }, [cargarProductos]);

  // Lista dinámica de categorías presentes en los productos
  const categoriasDisponibles = useMemo(() => {
    const cats = Array.from(new Set(productos.map((p) => p.categoria).filter(Boolean)));
    return cats.sort();
  }, [productos]);

  // Filtro compuesto (Búsqueda + Categoría + Estado + Vencimiento)
  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      // 1. Búsqueda por texto
      const matchTexto =
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.categoria.toLowerCase().includes(busqueda.toLowerCase());
      if (!matchTexto) return false;

      // 2. Filtro de Categoría
      if (categoriaSel !== 'todas' && p.categoria !== categoriaSel) {
        return false;
      }

      // 3. Filtro de Estado / Nivel de Stock / Vencimiento
      const stock = Number(p.stock_actual);
      const min = Number(p.stock_minimo);
      if (filtroEstado === 'bajo') {
        return stock > 0 && stock <= min;
      }
      if (filtroEstado === 'agotado') {
        return stock === 0;
      }
      if (filtroEstado === 'disponible') {
        return stock > min;
      }
      if (filtroEstado === 'vencer') {
        return Boolean(p.proximo_a_vencer);
      }

      return true;
    });
  }, [productos, busqueda, categoriaSel, filtroEstado]);

  const abrirCrear = () => {
    setProductoEdit(null);
    setModalOpen(true);
  };

  const abrirEditar = (prod) => {
    setProductoEdit(prod);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
  };

  const onGuardado = () => {
    cerrarModal();
    cargarProductos();
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6" data-purpose="inventory-management-view">
      
      {/* ── Encabezado de Página ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Stock</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestión y control de inventario en tiempo real · Comedor "Manos que Alimentan"
          </p>
        </div>
        <button
          id="btn-nuevo-producto"
          onClick={abrirCrear}
          type="button"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0d825c] hover:bg-[#0a6b4c] text-white text-sm font-semibold shadow-sm hover:shadow transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0d825c] focus:ring-offset-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          <span>Nuevo producto</span>
        </button>
      </div>

      {/* ── Barra de Búsqueda y Filtro de Categoría ──────────────────── */}
      <div className="flex flex-col md:flex-row gap-3 pt-2">
        {/* Input Buscador */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            id="buscador-productos"
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar producto por nombre o categoría..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-[#0d825c] focus:ring-1 focus:ring-[#0d825c] transition shadow-xs"
          />
        </div>

        {/* Dropdown de Categorías */}
        <div className="relative w-full md:w-64">
          <select
            id="filtro-categoria"
            value={categoriaSel}
            onChange={(e) => setCategoriaSel(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-4 pr-10 text-sm text-slate-700 appearance-none focus:outline-none focus:border-[#0d825c] focus:ring-1 focus:ring-[#0d825c] shadow-xs cursor-pointer"
          >
            <option value="todas">Categoría: todas</option>
            {categoriasDisponibles.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-3.5 pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Filtros Rápidos de Estado (Pills) ────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
        <button
          type="button"
          onClick={() => setFiltroEstado('todos')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
            filtroEstado === 'todos'
              ? 'bg-[#cbfce7] text-[#086345] shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Todos ({productos.length})
        </button>

        <button
          type="button"
          onClick={() => setFiltroEstado('bajo')}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
            filtroEstado === 'bajo'
              ? 'bg-[#fffbeb] text-amber-800 border border-amber-300 font-semibold shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-amber-50/50'
          }`}
        >
          Stock bajo
        </button>

        <button
          type="button"
          onClick={() => setFiltroEstado('vencer')}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
            filtroEstado === 'vencer'
              ? 'bg-[#fff7ed] text-[#b45309] border border-orange-300 font-semibold shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-orange-50/50'
          }`}
        >
          Próximo a vencer
        </button>

        <button
          type="button"
          onClick={() => setFiltroEstado('agotado')}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
            filtroEstado === 'agotado'
              ? 'bg-slate-200 text-slate-800 font-semibold shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Agotado
        </button>

        <button
          type="button"
          onClick={() => setFiltroEstado('disponible')}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
            filtroEstado === 'disponible'
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-emerald-50/50'
          }`}
        >
          Disponible
        </button>
      </div>

      {/* ── Estados de Carga y Error ─────────────────────────────────── */}
      {loading && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center shadow-xs">
          <div className="inline-block animate-spin text-3xl mb-3">⏳</div>
          <p className="text-slate-500 font-medium text-sm">Cargando inventario de productos...</p>
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-5 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
          <button
            onClick={cargarProductos}
            className="text-xs bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* ── Tabla de Inventario Fiel a Stitch UI ─────────────────────── */}
      {!loading && !error && (
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="text-xs font-semibold text-slate-500 uppercase border-b border-slate-100 bg-slate-50/60">
                <tr>
                  <th scope="col" className="py-4 px-6 font-semibold">Producto</th>
                  <th scope="col" className="py-4 px-6 font-semibold hidden sm:table-cell">Categoría</th>
                  <th scope="col" className="py-4 px-6 font-semibold">Stock</th>
                  <th scope="col" className="py-4 px-6 font-semibold hidden md:table-cell">Mínimo</th>
                  <th scope="col" className="py-4 px-6 font-semibold hidden lg:table-cell">Vence</th>
                  <th scope="col" className="py-4 px-6 font-semibold">Estado</th>
                  <th scope="col" className="py-4 px-6 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-14 text-center text-slate-400">
                      <div className="text-3xl mb-2">🔍</div>
                      <p className="font-medium text-slate-600">No se encontraron productos</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Probá ajustando los términos de búsqueda o los filtros seleccionados.
                      </p>
                    </td>
                  </tr>
                ) : (
                  productosFiltrados.map((prod) => {
                    const stock = Number(prod.stock_actual);
                    const min = Number(prod.stock_minimo);
                    const estaAgotado = stock === 0;
                    const stockBajo = !estaAgotado && stock <= min;

                    return (
                      <tr key={prod.id_producto} className="hover:bg-slate-50/70 transition">
                        {/* Producto */}
                        <td className="py-4 px-6">
                          <div className="font-semibold text-slate-900">{prod.nombre}</div>
                          <div className="text-xs text-slate-400 sm:hidden mt-0.5">{prod.categoria}</div>
                        </td>

                        {/* Categoría */}
                        <td className="py-4 px-6 text-slate-500 hidden sm:table-cell">
                          {prod.categoria}
                        </td>

                        {/* Stock */}
                        <td className="py-4 px-6">
                          <span className={`font-semibold ${
                            estaAgotado
                              ? 'text-slate-500'
                              : stockBajo
                              ? 'text-amber-600'
                              : 'text-slate-800'
                          }`}>
                            {stock.toFixed(2)} <span className="text-xs font-normal text-slate-400">{prod.unidad}</span>
                          </span>
                        </td>

                        {/* Mínimo */}
                        <td className="py-4 px-6 text-slate-500 hidden md:table-cell">
                          {min.toFixed(2)} {prod.unidad}
                        </td>

                        {/* Próximo Vencimiento */}
                        <td className="py-4 px-6 hidden lg:table-cell">
                          {prod.proximo_vencimiento ? (
                            <span className={`text-xs font-medium ${
                              prod.proximo_a_vencer ? 'text-orange-600 font-semibold' : 'text-slate-500'
                            }`}>
                              {new Date(prod.proximo_vencimiento).toLocaleDateString('es-AR', { timeZone: 'UTC' })}
                              {prod.proximo_a_vencer && (
                                <span className="ml-1 text-[10px] bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded-full">
                                  Próximo
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </td>

                        {/* Estado Badge */}
                        <td className="py-4 px-6">
                          {estaAgotado ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#eef2f6] text-slate-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                              Agotado
                            </span>
                          ) : stockBajo ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#fffbeb] text-amber-800 border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              Stock bajo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#e8f7f0] text-[#0d825c] border border-[#a2dfc3]/40">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#0d825c]"></span>
                              Disponible
                            </span>
                          )}
                        </td>

                        {/* Acciones */}
                        <td className="py-4 px-6 text-right">
                          <button
                            id={`btn-editar-${prod.id_producto}`}
                            onClick={() => abrirEditar(prod)}
                            type="button"
                            className="inline-flex items-center gap-1 text-[#0d825c] hover:text-[#085a3f] font-semibold text-xs hover:underline cursor-pointer"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            <span>Editar</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer de Tabla */}
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/40">
            <span>
              Mostrando <strong className="text-slate-700">{productosFiltrados.length}</strong> de <strong className="text-slate-700">{productos.length}</strong> productos
            </span>
            <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Sistema actualizado</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal de Creación / Edición ──────────────────────────────── */}
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
