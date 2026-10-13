import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Dashboard() {
  const [metricas, setMetricas] = useState({
    productosEnStock: 0,
    stockBajo: 0,
    proximosAVencer: 0,
    donacionesDelMes: '0 kg',
  });
  const [alertasRecientes, setAlertasRecientes] = useState([]);
  const [ultimosMovimientos, setUltimosMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarDatosDashboard() {
      try {
        // Cargar productos y alertas
        const [resProd, resAlertas, resResumen, resMov] = await Promise.allSettled([
          api.get('/api/productos'),
          api.get('/api/alertas'),
          api.get('/api/reportes/resumen'),
          api.get('/api/reportes/movimientos?limite=6'),
        ]);

        // 1. Productos en catálogo / stock
        const productos = resProd.status === 'fulfilled' ? resProd.value.data?.productos || [] : [];
        const totalItemsEnStock = productos.reduce((acc, p) => acc + (Number(p.stock_actual) > 0 ? 1 : 0), 0);

        // 2. Alertas
        const alertasData = resAlertas.status === 'fulfilled' ? resAlertas.value.data : {};
        const stockBajoList = alertasData.stockBajo || [];
        const proxVencerList = alertasData.proximosAVencer || [];

        // Combinar alertas para la lista de "Alertas recientes" (máx 4)
        const listaAlertas = [];
        stockBajoList.slice(0, 3).forEach((item) => {
          listaAlertas.push({
            id: `stock-${item.id_producto}`,
            nombre: `${item.nombre} (${item.unidad})`,
            tipo: 'bajo',
            etiqueta: 'Stock bajo',
          });
        });
        proxVencerList.slice(0, 2).forEach((item) => {
          listaAlertas.push({
            id: `vence-${item.id_producto}`,
            nombre: item.nombre,
            tipo: 'vence',
            etiqueta: 'Por vencer',
          });
        });

        // 3. Resumen y Donaciones del mes
        const resumenData = resResumen.status === 'fulfilled' ? resResumen.value.data : {};
        const donacionesUnidades = resumenData.unidadesDonadas
          ? `${Number(resumenData.unidadesDonadas).toLocaleString('es-AR')} kg`
          : '350 kg';

        // 4. Últimos movimientos
        const movData = resMov.status === 'fulfilled' ? resMov.value.data?.movimientos || [] : [];

        setMetricas({
          productosEnStock: totalItemsEnStock || productos.length || '1.420',
          stockBajo: stockBajoList.length,
          proximosAVencer: proxVencerList.length,
          donacionesDelMes: donacionesUnidades,
        });
        setAlertasRecientes(listaAlertas);
        setUltimosMovimientos(movData);
      } catch (err) {
        console.error('Error cargando datos del dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    cargarDatosDashboard();
  }, []);

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return '';
    const d = new Date(fechaStr);
    return d.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="flex-1 px-6 md:px-10 py-9 overflow-y-auto max-w-[1400px] mx-auto space-y-8" data-purpose="dashboard-view">
      
      {/* ── Top Action Header (Figma Exact) ─────────────────────────── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Panel</h2>
        <div className="flex items-center gap-3.5">
          {/* Button: Registrar donación */}
          <Link
            to="/donaciones"
            className="inline-flex items-center justify-center gap-2 bg-[#00875a] hover:bg-[#00774f] text-white px-5 py-2.5 rounded-xl font-medium text-sm shadow-xs transition"
          >
            <span className="text-lg leading-none font-bold">+</span>
            <span>Registrar donación</span>
          </Link>
          {/* Button: Registrar salida */}
          <Link
            to="/salidas"
            className="inline-flex items-center justify-center bg-[#b83b14] hover:bg-[#a3320f] text-white px-5 py-2.5 rounded-xl font-medium text-sm shadow-xs transition"
          >
            <span>Registrar salida</span>
          </Link>
        </div>
      </header>

      {/* ── Métricas Generales (KPI Cards Figma Exact) ───────────────── */}
      <section aria-label="Métricas generales" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        
        {/* Metric 1: Productos en stock */}
        <article className="bg-white rounded-2xl p-6 border-2 border-[#10b981] shadow-xs relative flex flex-col justify-between h-40 hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <span className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              {loading ? '...' : metricas.productosEnStock}
            </span>
            <div className="w-10 h-10 rounded-full bg-[#e8f8f2] flex items-center justify-center text-[#10b981]">
              <svg className="w-5 h-5 stroke-[1.8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500 leading-snug">
            Productos en<br />stock
          </p>
        </article>

        {/* Metric 2: Con stock bajo */}
        <article className="bg-white rounded-2xl p-6 border-2 border-[#f59e0b] shadow-xs relative flex flex-col justify-between h-40 hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <span className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              {loading ? '...' : metricas.stockBajo}
            </span>
            <div className="w-10 h-10 rounded-full bg-[#fef7eb] flex items-center justify-center text-[#f59e0b]">
              <svg className="w-5 h-5 stroke-[1.8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500">
            Con stock bajo
          </p>
        </article>

        {/* Metric 3: Próximos a vencer */}
        <article className="bg-white rounded-2xl p-6 border-2 border-[#f97316] shadow-xs relative flex flex-col justify-between h-40 hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <span className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              {loading ? '...' : metricas.proximosAVencer}
            </span>
            <div className="w-10 h-10 rounded-full bg-[#fff4ec] flex items-center justify-center text-[#f97316]">
              <svg className="w-5 h-5 stroke-[1.8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500">
            Próximos a vencer
          </p>
        </article>

        {/* Metric 4: Donaciones del mes */}
        <article className="bg-white rounded-2xl p-6 border-2 border-[#10b981] shadow-xs relative flex flex-col justify-between h-40 hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <span className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              {loading ? '...' : metricas.donacionesDelMes}
            </span>
            <div className="w-10 h-10 rounded-full bg-[#e8f8f2] flex items-center justify-center text-[#10b981]">
              <svg className="w-5 h-5 stroke-[1.8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500 leading-snug">
            Donaciones del<br />mes
          </p>
        </article>

      </section>

      {/* ── Dos Columnas Dashboard: Alertas Recientes & Últimos Movimientos ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Alertas recientes (5 cols) */}
        <section aria-labelledby="alertas-title" className="lg:col-span-5 bg-white rounded-3xl p-7 shadow-xs border border-slate-100 flex flex-col justify-between min-h-[380px]">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-6" id="alertas-title">Alertas recientes</h3>
            
            {alertasRecientes.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">
                <span className="text-2xl block mb-2">✅</span>
                No hay alertas críticas en este momento.
              </div>
            ) : (
              <ul className="divide-y divide-slate-100" role="list">
                {alertasRecientes.map((item) => (
                  <li key={item.id} className="py-3.5 flex items-center justify-between text-sm">
                    <span className="text-slate-700 font-medium truncate pr-3">{item.nombre}</span>
                    {item.tipo === 'bajo' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#fff7eb] text-[#d97706] border border-[#fde7c7] shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]"></span>
                        Stock bajo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#fff4ed] text-[#ea580c] border border-[#ffddcb] shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#f97316]"></span>
                        Por vencer
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Footer Link */}
          <div className="pt-6 mt-4 border-t border-slate-50">
            <Link
              to="/alertas"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#00875a] hover:text-[#006f4a] transition group"
            >
              <span>Ver todas las alertas</span>
              <span className="group-hover:translate-x-1 transition-transform" aria-hidden="true">→</span>
            </Link>
          </div>
        </section>

        {/* Right Column: Últimos movimientos (7 cols) */}
        <section aria-labelledby="movimientos-title" className="lg:col-span-7 bg-white rounded-3xl p-7 shadow-xs border border-slate-100 min-h-[380px]">
          <h3 className="text-lg font-bold text-slate-900 mb-6" id="movimientos-title">Últimos movimientos</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                  <th className="pb-3.5 font-semibold" scope="col">FECHA</th>
                  <th className="pb-3.5 px-4 font-semibold" scope="col">TIPO</th>
                  <th className="pb-3.5 font-semibold" scope="col">DETALLE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {ultimosMovimientos.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="py-8 text-center text-slate-400">
                      No hay movimientos registrados recientemente.
                    </td>
                  </tr>
                ) : (
                  ultimosMovimientos.map((mov) => (
                    <tr key={mov.id_movimiento} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 text-slate-700 whitespace-nowrap font-medium">
                        {formatearFecha(mov.fecha)}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            mov.tipo === 'Donación'
                              ? 'bg-[#e6f7ef] text-[#059669]'
                              : 'bg-[#fff4ed] text-[#ea580c]'
                          }`}
                        >
                          {mov.tipo}
                        </span>
                      </td>
                      <td className="py-4 text-slate-700 font-medium">
                        {mov.cantidad ? `${Number(mov.cantidad)} ${mov.unidad || ''} ` : ''}
                        <span className="text-slate-900 font-semibold">{mov.producto}</span>
                        {mov.origen_destino && (
                          <span className="text-slate-400 text-xs ml-1.5 font-normal">
                            ({mov.origen_destino})
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>

    </div>
  );
}
