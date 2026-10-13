import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const MOTIVOS = ['Vianda', 'Merienda', 'Otro'];

export default function RegistrarSalida() {
  const navigate = useNavigate();

  // Catálogo de productos disponibles
  const [productos, setProductos] = useState([]);
  const [loadingProductos, setLoadingProductos] = useState(true);

  // Cabecera de la salida
  const [fecha, setFecha] = useState(() => new Date().toISOString().split('T')[0]);
  const [motivo, setMotivo] = useState('Vianda');
  const [observaciones, setObservaciones] = useState('');

  // Líneas de productos a retirar
  const [lineas, setLineas] = useState([
    { id_producto: '', cantidad: '' },
  ]);

  // Estados de envío y feedback
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(null);

  // Cargar catálogo de productos activos
  useEffect(() => {
    async function cargarCatalogo() {
      try {
        const { data } = await api.get('/api/stock');
        setProductos(data.stock || data.productos || []);
      } catch (err) {
        console.error('Error al cargar inventario:', err);
        setError('No se pudo cargar el inventario de productos.');
      } finally {
        setLoadingProductos(false);
      }
    }
    cargarCatalogo();
  }, []);

  const productosMap = useMemo(() => {
    const map = new Map();
    productos.forEach((p) => map.set(String(p.id_producto), p));
    return map;
  }, [productos]);

  const handleAgregarLinea = () => {
    setLineas((prev) => [...prev, { id_producto: '', cantidad: '' }]);
  };

  const handleQuitarLinea = (index) => {
    if (lineas.length === 1) {
      setLineas([{ id_producto: '', cantidad: '' }]);
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
    setMotivo('Vianda');
    setObservaciones('');
    setLineas([{ id_producto: '', cantidad: '' }]);
    setError('');
    setExito(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fecha) {
      setError('Por favor especificá la fecha de la salida.');
      return;
    }

    if (!motivo) {
      setError('Por favor seleccioná el motivo de la salida.');
      return;
    }

    const lineasValidas = lineas.filter(
      (l) => l.id_producto && Number(l.cantidad) > 0
    );

    if (lineasValidas.length === 0) {
      setError('Debés ingresar al menos un producto a retirar con una cantidad mayor a 0.');
      return;
    }

    // Verificar en el cliente si alguna cantidad supera el stock disponible
    for (const l of lineasValidas) {
      const prod = productosMap.get(String(l.id_producto));
      if (prod) {
        const stockDisp = Number(prod.stock_actual);
        const cantPedida = Number(l.cantidad);
        if (cantPedida > stockDisp) {
          setError(
            `Stock insuficiente para "${prod.nombre}". Disponible: ${stockDisp} ${prod.unidad}, solicitaste: ${cantPedida} ${prod.unidad}.`
          );
          return;
        }
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        fecha,
        motivo,
        observaciones: observaciones.trim() || undefined,
        detalles: lineasValidas.map((l) => ({
          id_producto: Number(l.id_producto),
          cantidad: Number(l.cantidad),
        })),
      };

      const { data } = await api.post('/api/salidas', payload);
      setExito({
        id: data.salida.id_salida,
        itemsCount: data.salida.detalles.length,
        motivo: data.salida.motivo,
      });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Error al registrar la salida en el servidor.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto space-y-7" data-purpose="registrar-salida-view">
      
      {/* ── Encabezado ─────────────────────────────────────────────── */}
      <header className="space-y-1">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Registrar salida / distribución
        </h1>
        <p className="text-sm text-slate-500 font-normal">
          Registrá los productos retirados para comedores, viandas o distribución comunitaria.
        </p>
      </header>

      {/* ── Mensaje de Éxito ────────────────────────────────────────── */}
      {exito && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📤</span>
            <div>
              <h3 className="font-bold text-amber-950 text-base">
                ¡Salida #{exito.id} ({exito.motivo}) registrada con éxito!
              </h3>
              <p className="text-xs text-amber-700 mt-0.5">
                Se descontó el stock de {exito.itemsCount} productos en el inventario.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetForm}
              className="bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer"
            >
              + Registrar otra salida
            </button>
            <button
              type="button"
              onClick={() => navigate('/productos')}
              className="border border-amber-300 text-amber-800 hover:bg-amber-100/60 text-xs font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer"
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

      {/* ── Formulario de Salida ─────────────────────────────────────── */}
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
                className="w-full rounded-xl border border-slate-200 text-slate-700 text-sm py-2.5 px-3.5 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 bg-white transition shadow-none"
              />
            </div>

            {/* Motivo */}
            <div>
              <label htmlFor="motivo" className="block text-sm font-semibold text-slate-800 mb-2">
                Motivo *
              </label>
              <select
                id="motivo"
                name="motivo"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                disabled={submitting}
                className="w-full rounded-xl border border-slate-200 text-slate-700 text-sm py-2.5 px-3.5 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 bg-white transition shadow-none cursor-pointer"
              >
                {MOTIVOS.map((m) => (
                  <option key={m} value={m}>
                    {m === 'Vianda' ? 'Viandas comunitarias' : m === 'Merienda' ? 'Meriendas' : 'Otro destino'}
                  </option>
                ))}
              </select>
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
                placeholder="Ej: Preparación de 120 viandas turno mediodía"
                disabled={submitting}
                className="w-full rounded-xl border border-slate-200 text-slate-700 text-sm py-2.5 px-3.5 placeholder-slate-400 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 bg-white transition shadow-none"
              />
            </div>
          </div>
        </section>

        {/* Card 2: Productos a Retirar */}
        <section className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Productos a retirar
            </h2>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              {lineas.length} {lineas.length === 1 ? 'ítem listado' : 'ítems listados'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-xs font-semibold uppercase tracking-wider text-slate-500 text-left">
                  <th className="w-[45%] pb-1 font-semibold">PRODUCTO</th>
                  <th className="w-[20%] pb-1 font-semibold">DISPONIBLE</th>
                  <th className="w-[23%] pb-1 font-semibold">CANTIDAD</th>
                  <th className="w-[12%] pb-1 text-right font-semibold pr-2">ACCIÓN</th>
                </tr>
              </thead>
              <tbody>
                {lineas.map((linea, idx) => {
                  const prodSeleccionado = productosMap.get(String(linea.id_producto));
                  const stockDisponible = prodSeleccionado ? Number(prodSeleccionado.stock_actual) : null;

                  return (
                    <tr key={idx} className="group">
                      {/* Selector de Producto */}
                      <td className="pr-2">
                        <select
                          id={`salida-producto-select-${idx}`}
                          value={linea.id_producto}
                          onChange={(e) => handleCambioLinea(idx, 'id_producto', e.target.value)}
                          disabled={submitting || loadingProductos}
                          className="w-full rounded-xl border border-slate-200 text-slate-700 text-sm py-2.5 px-3 bg-white focus:border-amber-600 focus:ring-1 focus:ring-amber-600 transition cursor-pointer"
                        >
                          <option value="">Seleccionar producto con stock...</option>
                          {productos.map((p) => {
                            const stockNum = Number(p.stock_actual);
                            return (
                              <option key={p.id_producto} value={p.id_producto}>
                                {p.nombre} ({stockNum.toFixed(2)} {p.unidad} disponibles)
                              </option>
                            );
                          })}
                        </select>
                      </td>

                      {/* Stock Disponible (Pill Stitch UI) */}
                      <td className="pr-2">
                        {prodSeleccionado ? (
                          <div
                            className={`rounded-xl px-3 py-2 text-xs font-semibold text-center border ${
                              stockDisponible > 0
                                ? 'bg-[#e8f7f0] text-[#0d825c] border-[#a2dfc3]/50'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}
                          >
                            {stockDisponible > 0
                              ? `${stockDisponible.toFixed(2)} ${prodSeleccionado.unidad} en almacén`
                              : '0 disponible (Agotado)'}
                          </div>
                        ) : (
                          <div className="rounded-xl px-3 py-2 text-xs text-slate-400 text-center bg-slate-50 border border-slate-200">
                            —
                          </div>
                        )}
                      </td>

                      {/* Cantidad a Retirar */}
                      <td className="pr-2">
                        <input
                          id={`salida-cantidad-input-${idx}`}
                          type="number"
                          step="0.01"
                          min="0.01"
                          max={stockDisponible || undefined}
                          value={linea.cantidad}
                          onChange={(e) => handleCambioLinea(idx, 'cantidad', e.target.value)}
                          placeholder="0"
                          disabled={submitting || !prodSeleccionado || stockDisponible === 0}
                          className="w-full rounded-xl border border-slate-200 text-slate-700 text-sm py-2.5 px-3.5 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 bg-white transition text-right"
                        />
                      </td>

                      {/* Acción Quitar */}
                      <td className="text-right pr-2">
                        <button
                          type="button"
                          id={`btn-salida-quitar-${idx}`}
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
              id="btn-agregar-salida-linea"
              onClick={handleAgregarLinea}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-dashed border-amber-600/50 text-amber-800 hover:bg-amber-50/50 hover:border-amber-600 font-semibold text-sm transition cursor-pointer"
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
            id="btn-cancelar-salida"
            onClick={() => navigate('/dashboard')}
            disabled={submitting}
            className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-sm transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            id="btn-registrar-salida"
            disabled={submitting}
            className="px-7 py-3 rounded-xl bg-[#c2410c] hover:bg-[#9a3412] disabled:bg-orange-300 text-white font-semibold text-sm shadow-xs hover:shadow transition flex items-center gap-2 cursor-pointer"
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>Registrando salida...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>Registrar salida</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
