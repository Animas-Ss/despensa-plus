import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function RegistrarDonacion() {
  const navigate = useNavigate();

  // Catálogo de productos disponibles
  const [productos, setProductos] = useState([]);
  const [loadingProductos, setLoadingProductos] = useState(true);

  // Cabecera de la Donación
  const [fecha, setFecha] = useState(() => new Date().toISOString().split('T')[0]);
  const [donante, setDonante] = useState('');
  const [observaciones, setObservaciones] = useState('');

  // Líneas de productos a donar
  const [lineas, setLineas] = useState([
    { id_producto: '', cantidad: '', fecha_vencimiento: '' },
  ]);

  // Estados de envío y feedback
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(null);

  // Cargar catálogo de productos activos
  useEffect(() => {
    async function cargarCatalogo() {
      try {
        const { data } = await api.get('/api/productos?solo_activos=true');
        setProductos(data.productos || []);
      } catch (err) {
        console.error('Error al cargar catálogo:', err);
        setError('No se pudo cargar el catálogo de productos. Verificá tu conexión.');
      } finally {
        setLoadingProductos(false);
      }
    }
    cargarCatalogo();
  }, []);

  // Mapa rápido de productos por ID
  const productosMap = useMemo(() => {
    const map = new Map();
    productos.forEach((p) => map.set(String(p.id_producto), p));
    return map;
  }, [productos]);

  // Manejo dinámico de filas
  const handleAgregarLinea = () => {
    setLineas((prev) => [
      ...prev,
      { id_producto: '', cantidad: '', fecha_vencimiento: '' },
    ]);
  };

  const handleQuitarLinea = (index) => {
    if (lineas.length === 1) {
      setLineas([{ id_producto: '', cantidad: '', fecha_vencimiento: '' }]);
      return;
    }
    setLineas((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCambioLinea = (index, campo, valor) => {
    setLineas((prev) => {
      const actualizadas = [...prev];
      actualizadas[index] = {
        ...actualizadas[index],
        [campo]: valor,
      };
      return actualizadas;
    });
    setError('');
  };

  const handleResetForm = () => {
    setFecha(new Date().toISOString().split('T')[0]);
    setDonante('');
    setObservaciones('');
    setLineas([{ id_producto: '', cantidad: '', fecha_vencimiento: '' }]);
    setError('');
    setExito(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones del lado del cliente
    if (!fecha) {
      setError('Por favor especificá la fecha de la donación.');
      return;
    }

    const lineasValidas = lineas.filter(
      (l) => l.id_producto && Number(l.cantidad) > 0
    );

    if (lineasValidas.length === 0) {
      setError('Debés ingresar al menos un producto con una cantidad mayor a 0.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        fecha,
        donante: donante.trim() || undefined,
        observaciones: observaciones.trim() || undefined,
        detalles: lineasValidas.map((l) => ({
          id_producto: Number(l.id_producto),
          cantidad: Number(l.cantidad),
          fecha_vencimiento: l.fecha_vencimiento || undefined,
        })),
      };

      const { data } = await api.post('/api/donaciones', payload);
      setExito({
        id: data.donacion.id_donacion,
        itemsCount: data.donacion.detalles.length,
        message: data.message,
      });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Error al registrar la donación en el servidor.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto space-y-7" data-purpose="registrar-donacion-view">
      
      {/* ── Encabezado ─────────────────────────────────────────────── */}
      <header className="space-y-1">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Registrar donación
        </h1>
        <p className="text-sm text-slate-500 font-normal">
          Ingresá los datos generales del ingreso y el listado de productos recibidos en el comedor.
        </p>
      </header>

      {/* ── Mensaje de Éxito ────────────────────────────────────────── */}
      {exito && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎉</span>
            <div>
              <h3 className="font-bold text-emerald-950 text-base">
                ¡Donación #{exito.id} registrada con éxito!
              </h3>
              <p className="text-xs text-emerald-700 mt-0.5">
                Se actualizaron {exito.itemsCount} productos en el stock en tiempo real.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetForm}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer"
            >
              + Registrar otra donación
            </button>
            <button
              type="button"
              onClick={() => navigate('/productos')}
              className="border border-emerald-300 text-emerald-800 hover:bg-emerald-100/60 text-xs font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer"
            >
              Ver Stock
            </button>
          </div>
        </div>
      )}

      {/* ── Mensaje de Error ────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-5 text-sm flex items-start gap-3">
          <span className="text-lg">⚠️</span>
          <span className="mt-0.5">{error}</span>
        </div>
      )}

      {/* ── Formulario de Donación ───────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        
        {/* Card 1: Datos Generales */}
        <section className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Fecha */}
            <div>
              <label htmlFor="fecha" className="block text-sm font-semibold text-slate-800 mb-2">
                Fecha *
              </label>
              <input
                id="fecha"
                name="fecha"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                disabled={submitting}
                className="w-full rounded-xl border border-slate-200 text-slate-700 text-sm py-2.5 px-3.5 focus:border-[#0d825c] focus:ring-1 focus:ring-[#0d825c] bg-white transition shadow-none"
              />
            </div>

            {/* Donante */}
            <div>
              <label htmlFor="donante" className="block text-sm font-semibold text-slate-800 mb-2">
                Donante (opcional)
              </label>
              <input
                id="donante"
                name="donante"
                type="text"
                value={donante}
                onChange={(e) => setDonante(e.target.value)}
                placeholder="Nombre o entidad donante"
                disabled={submitting}
                className="w-full rounded-xl border border-slate-200 text-slate-700 text-sm py-2.5 px-3.5 placeholder-slate-400 focus:border-[#0d825c] focus:ring-1 focus:ring-[#0d825c] bg-white transition shadow-none"
              />
            </div>

            {/* Observaciones */}
            <div>
              <label htmlFor="observaciones" className="block text-sm font-semibold text-slate-800 mb-2">
                Observaciones
              </label>
              <input
                id="observaciones"
                name="observaciones"
                type="text"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Notas o detalles del ingreso"
                disabled={submitting}
                className="w-full rounded-xl border border-slate-200 text-slate-700 text-sm py-2.5 px-3.5 placeholder-slate-400 focus:border-[#0d825c] focus:ring-1 focus:ring-[#0d825c] bg-white transition shadow-none"
              />
            </div>
          </div>
        </section>

        {/* Card 2: Productos Donados */}
        <section className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Productos donados
            </h2>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
              {lineas.length} {lineas.length === 1 ? 'ítem listado' : 'ítems listados'}
            </span>
          </div>

          {/* Tabla de Filas Dinámicas */}
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-xs font-semibold uppercase tracking-wider text-slate-500 text-left">
                  <th className="w-[35%] pb-1 font-semibold">PRODUCTO</th>
                  <th className="w-[18%] pb-1 font-semibold">CANTIDAD</th>
                  <th className="w-[12%] pb-1 font-semibold">UNIDAD</th>
                  <th className="w-[23%] pb-1 font-semibold">VENCIMIENTO</th>
                  <th className="w-[12%] pb-1 text-right font-semibold pr-2">ACCIÓN</th>
                </tr>
              </thead>
              <tbody>
                {lineas.map((linea, idx) => {
                  const prodSeleccionado = productosMap.get(String(linea.id_producto));

                  return (
                    <tr key={idx} className="group">
                      {/* Selector de Producto */}
                      <td className="pr-2">
                        <select
                          id={`producto-select-${idx}`}
                          value={linea.id_producto}
                          onChange={(e) => handleCambioLinea(idx, 'id_producto', e.target.value)}
                          disabled={submitting || loadingProductos}
                          className="w-full rounded-xl border border-slate-200 text-slate-700 text-sm py-2.5 px-3 bg-white focus:border-[#0d825c] focus:ring-1 focus:ring-[#0d825c] transition cursor-pointer"
                        >
                          <option value="">Seleccionar producto...</option>
                          {productos.map((p) => (
                            <option key={p.id_producto} value={p.id_producto}>
                              {p.nombre} ({p.categoria})
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Cantidad */}
                      <td className="pr-2">
                        <input
                          id={`cantidad-input-${idx}`}
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={linea.cantidad}
                          onChange={(e) => handleCambioLinea(idx, 'cantidad', e.target.value)}
                          placeholder="0"
                          disabled={submitting}
                          className="w-full rounded-xl border border-slate-200 text-slate-700 text-sm py-2.5 px-3.5 focus:border-[#0d825c] focus:ring-1 focus:ring-[#0d825c] bg-white transition text-right"
                        />
                      </td>

                      {/* Unidad (Readonly) */}
                      <td className="pr-2">
                        <div className="w-full rounded-xl border border-slate-200 text-slate-500 text-sm py-2.5 px-3.5 bg-slate-50/80 text-center font-mono">
                          {prodSeleccionado ? `[${prodSeleccionado.unidad}]` : '—'}
                        </div>
                      </td>

                      {/* Vencimiento */}
                      <td className="pr-2">
                        <input
                          id={`vencimiento-input-${idx}`}
                          type="date"
                          value={linea.fecha_vencimiento}
                          onChange={(e) => handleCambioLinea(idx, 'fecha_vencimiento', e.target.value)}
                          disabled={submitting}
                          className="w-full rounded-xl border border-slate-200 text-slate-700 text-sm py-2.5 px-3.5 focus:border-[#0d825c] focus:ring-1 focus:ring-[#0d825c] bg-white transition"
                        />
                      </td>

                      {/* Acción Quitar */}
                      <td className="text-right pr-2">
                        <button
                          type="button"
                          id={`btn-quitar-${idx}`}
                          onClick={() => handleQuitarLinea(idx)}
                          disabled={submitting}
                          className="text-xs text-slate-500 hover:text-red-700 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-xl px-3 py-2 transition cursor-pointer"
                        >
                          Quitar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Botón Agregar Producto */}
          <div>
            <button
              type="button"
              id="btn-agregar-producto-linea"
              onClick={handleAgregarLinea}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-dashed border-[#0d825c]/50 text-[#0d825c] hover:bg-emerald-50/50 hover:border-[#0d825c] font-semibold text-sm transition cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
              <span>+ Agregar producto</span>
            </button>
          </div>
        </section>

        {/* ── Botones de Acción al Pie ──────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 pt-3">
          <button
            type="button"
            id="btn-cancelar-donacion"
            onClick={() => navigate('/dashboard')}
            disabled={submitting}
            className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-sm transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            id="btn-registrar-donacion"
            disabled={submitting}
            className="px-7 py-3 rounded-xl bg-[#0d825c] hover:bg-[#0a6b4c] disabled:bg-emerald-300 text-white font-semibold text-sm shadow-sm hover:shadow transition flex items-center gap-2 cursor-pointer"
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>Registrando donación...</span>
              </>
            ) : (
              'Registrar donación'
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
