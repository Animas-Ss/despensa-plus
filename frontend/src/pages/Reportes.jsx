import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export default function Reportes() {
  const [desde, setDesde] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [hasta, setHasta] = useState(() => new Date().toISOString().split('T')[0]);
  const [tipo, setTipo]   = useState('todos'); // 'todos' | 'donaciones' | 'salidas'

  const [resumen, setResumen]         = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [resumenRes, movRes] = await Promise.all([
        api.get(`/api/reportes/resumen?desde=${desde}&hasta=${hasta}`),
        api.get(`/api/reportes/movimientos?desde=${desde}&hasta=${hasta}&tipo=${tipo}&limite=50`),
      ]);

      setResumen(resumenRes.data);
      setMovimientos(movRes.data.movimientos || []);
    } catch (err) {
      console.error('Error cargando reportes:', err);
      setError('Error al generar los reportes del período seleccionado.');
    } finally {
      setLoading(false);
    }
  }, [desde, hasta, tipo]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleImprimir = () => {
    window.print();
  };

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-7 print:p-2" data-purpose="reportes-view">
      
      {/* ── Encabezado ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Reportes de movimientos
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Resumen estadístico y rendición de cuentas de ingresos y egresos del comedor.
          </p>
        </div>
        <button
          type="button"
          onClick={handleImprimir}
          className="inline-flex items-center gap-2 border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl font-semibold text-sm transition shadow-2xs print:hidden cursor-pointer"
        >
          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          <span>Exportar / Imprimir</span>
        </button>
      </div>

      {/* ── Filtros de Período y Tipo (Figma Stitch UI) ─────────────── */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs print:hidden">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            cargarDatos();
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end"
        >
          <div>
            <label htmlFor="desde" className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">
              Desde
            </label>
            <input
              id="desde"
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="w-full rounded-xl border border-slate-200 text-sm py-2 px-3 text-slate-700 focus:border-[#0d825c] focus:ring-1 focus:ring-[#0d825c] bg-white transition shadow-none"
            />
          </div>

          <div>
            <label htmlFor="hasta" className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">
              Hasta
            </label>
            <input
              id="hasta"
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="w-full rounded-xl border border-slate-200 text-sm py-2 px-3 text-slate-700 focus:border-[#0d825c] focus:ring-1 focus:ring-[#0d825c] bg-white transition shadow-none"
            />
          </div>

          <div>
            <label htmlFor="tipo" className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">
              Tipo
            </label>
            <select
              id="tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full rounded-xl border border-slate-200 text-sm py-2 px-3 text-slate-700 bg-white focus:border-[#0d825c] focus:ring-1 focus:ring-[#0d825c] transition cursor-pointer"
            >
              <option value="todos">Donaciones y salidas</option>
              <option value="donaciones">Solo donaciones (ingresos)</option>
              <option value="salidas">Solo salidas (viandas)</option>
            </select>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0d825c] hover:bg-[#0a6b4c] disabled:bg-emerald-300 text-white font-semibold py-2 px-4 rounded-xl text-sm transition shadow-2xs cursor-pointer"
            >
              {loading ? 'Generando...' : 'Generar reporte'}
            </button>
          </div>
        </form>
      </section>

      {/* ── Error ──────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-5 text-sm flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button onClick={cargarDatos} className="text-xs bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg">
            Reintentar
          </button>
        </div>
      )}

      {/* ── Tarjetas Resumen KPIs (3 Cards Stitch UI) ───────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Donaciones */}
        <div className="bg-white border-2 border-emerald-500/30 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-4xl font-extrabold text-slate-900 block tracking-tight">
              {loading ? '...' : resumen?.totalDonaciones || 0}
            </span>
            <p className="text-sm font-semibold text-slate-800 mt-2">Donaciones del período</p>
          </div>
          <p className="text-xs text-emerald-700 font-medium mt-4 flex items-center gap-1">
            <span>📦 Total ingresado: {resumen?.unidadesDonadas || 0} unidades</span>
          </p>
        </div>

        {/* Card 2: Salidas */}
        <div className="bg-white border-2 border-red-500/30 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-4xl font-extrabold text-slate-900 block tracking-tight">
              {loading ? '...' : resumen?.totalSalidas || 0}
            </span>
            <p className="text-sm font-semibold text-slate-800 mt-2">Salidas del período</p>
          </div>
          <p className="text-xs text-red-700 font-medium mt-4 flex items-center gap-1">
            <span>🍽️ Total distribuido: {resumen?.unidadesSalidas || 0} unidades</span>
          </p>
        </div>

        {/* Card 3: Productos Movilizados */}
        <div className="bg-white border-2 border-amber-500/40 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-4xl font-extrabold text-slate-900 block tracking-tight">
              {loading ? '...' : `${resumen?.totalProductosMovidos || 0}`}
            </span>
            <p className="text-sm font-semibold text-slate-800 mt-2">Total de unidades movilizadas</p>
          </div>
          <p className="text-xs text-amber-800 font-medium mt-4 flex items-center gap-1">
            <span>✓ Balance activo en almacén</span>
          </p>
        </div>

      </div>

      {/* ── Detalle de Movimientos Cronológicos ─────────────────────── */}
      <section className="bg-white border border-slate-200/90 rounded-3xl shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Detalle de movimientos</h2>
            <p className="text-xs text-slate-400 mt-0.5">Últimos movimientos registrados en el período</p>
          </div>
          <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-medium">
            {movimientos.length} registros
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="text-xs font-semibold text-slate-500 uppercase border-b border-slate-100 bg-slate-50/60">
              <tr>
                <th scope="col" className="py-4 px-6 font-semibold">Fecha</th>
                <th scope="col" className="py-4 px-6 font-semibold">Tipo</th>
                <th scope="col" className="py-4 px-6 font-semibold">Producto</th>
                <th scope="col" className="py-4 px-6 font-semibold hidden md:table-cell">Origen / Destino</th>
                <th scope="col" className="py-4 px-6 font-semibold text-right">Cantidad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movimientos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No hay movimientos registrados en el período seleccionado.
                  </td>
                </tr>
              ) : (
                movimientos.map((m, idx) => {
                  const esDonacion = m.tipo === 'Donación';

                  return (
                    <tr key={idx} className="hover:bg-slate-50/70 transition">
                      {/* Fecha */}
                      <td className="py-4 px-6 font-medium text-slate-800 text-xs">
                        {new Date(m.fecha).toLocaleDateString('es-AR', { timeZone: 'UTC' })}
                      </td>

                      {/* Tipo Badge */}
                      <td className="py-4 px-6">
                        {esDonacion ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-[#e8f7f0] text-[#0d825c] border border-[#a2dfc3]/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0d825c]"></span>
                            Donación
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-[#fff7ed] text-[#c2410c] border border-orange-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#c2410c]"></span>
                            Salida
                          </span>
                        )}
                      </td>

                      {/* Producto */}
                      <td className="py-4 px-6">
                        <span className="font-semibold text-slate-900">{m.producto}</span>
                        <span className="text-xs text-slate-400 ml-1">({m.categoria})</span>
                      </td>

                      {/* Origen / Destino */}
                      <td className="py-4 px-6 text-slate-500 text-xs hidden md:table-cell">
                        {m.origen_destino}
                      </td>

                      {/* Cantidad */}
                      <td className="py-4 px-6 text-right font-semibold">
                        <span className={esDonacion ? 'text-[#0d825c]' : 'text-[#c2410c]'}>
                          {esDonacion ? '+' : '-'}{Number(m.cantidad).toFixed(2)} {m.unidad}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
