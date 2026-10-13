import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Alertas() {
  const navigate = useNavigate();
  const [alertas, setAlertas] = useState({ stockBajo: [], proximosAVencer: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const cargarAlertas = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/api/alertas');
      setAlertas({
        stockBajo: data.stockBajo || [],
        proximosAVencer: data.proximosAVencer || [],
      });
    } catch (err) {
      console.error('Error cargando alertas:', err);
      setError('No se pudieron obtener las alertas del sistema.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarAlertas();
  }, []);

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-8" data-purpose="alertas-view">
      
      {/* ── Encabezado ─────────────────────────────────────────────── */}
      <header className="space-y-1">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Alertas
        </h1>
        <p className="text-sm text-slate-500 font-normal">
          Monitoreo automático de stock crítico y alimentos próximos a su fecha de vencimiento.
        </p>
      </header>

      {/* ── Feedback de Carga / Error ───────────────────────────────── */}
      {loading && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-16 text-center shadow-xs">
          <div className="inline-block animate-spin text-3xl mb-3">⏳</div>
          <p className="text-slate-500 font-medium text-sm">Analizando inventario y vencimientos...</p>
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-5 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
          <button
            onClick={cargarAlertas}
            className="text-xs bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* ── Grilla de Alertas Stitch UI (2 Columnas) ─────────────────── */}
      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Card 1: Stock Bajo */}
          <section className="bg-white rounded-3xl border border-amber-300/80 p-6 sm:p-8 shadow-xs flex flex-col justify-between">
            <div>
              {/* Badge Superior */}
              <div className="flex items-center justify-between mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#fffbeb] text-amber-800 border border-amber-200">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Stock bajo ({alertas.stockBajo.length})
                </span>
                <span className="text-xs text-slate-400">
                  Stock actual ≤ Stock mínimo
                </span>
              </div>

              {/* Lista de Productos con Stock Bajo */}
              <div className="divide-y divide-slate-100">
                {alertas.stockBajo.length === 0 ? (
                  <div className="py-12 text-center text-slate-400">
                    <span className="text-3xl block mb-2">✅</span>
                    <p className="text-sm font-medium text-slate-600">No hay productos con stock crítico</p>
                    <p className="text-xs text-slate-400 mt-1">Todos los artículos superan su stock mínimo establecido.</p>
                  </div>
                ) : (
                  alertas.stockBajo.map((p) => {
                    const stock = Number(p.stock_actual);
                    const min = Number(p.stock_minimo);
                    const agotado = stock === 0;

                    return (
                      <div key={p.id_producto} className="py-4 flex items-center justify-between gap-4">
                        <div>
                          <h4 className="font-semibold text-slate-900 text-sm">{p.nombre}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Stock: <strong className={agotado ? 'text-slate-400' : 'text-amber-700'}>{stock.toFixed(2)} {p.unidad}</strong>
                            {' · '}mínimo: <span className="text-slate-600">{min.toFixed(2)} {p.unidad}</span>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => navigate('/productos')}
                          className="border border-[#0d825c] text-[#0d825c] hover:bg-emerald-50 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 cursor-pointer"
                        >
                          Ver stock
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 mt-4 text-xs text-slate-400 flex items-center justify-between">
              <span>Actualizado automáticamente</span>
              <button
                onClick={() => navigate('/donaciones')}
                className="text-[#0d825c] font-semibold hover:underline"
              >
                + Registrar ingreso de donación →
              </button>
            </div>
          </section>

          {/* Card 2: Próximos a Vencer */}
          <section className="bg-white rounded-3xl border border-orange-300/80 p-6 sm:p-8 shadow-xs flex flex-col justify-between">
            <div>
              {/* Badge Superior */}
              <div className="flex items-center justify-between mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#fff7ed] text-[#c2410c] border border-orange-200">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                  Próximos a vencer ({alertas.proximosAVencer.length})
                </span>
                <span className="text-xs text-slate-400">
                  Vence en ≤ 30 días
                </span>
              </div>

              {/* Lista de Alimentos Próximos a Vencer */}
              <div className="divide-y divide-slate-100">
                {alertas.proximosAVencer.length === 0 ? (
                  <div className="py-12 text-center text-slate-400">
                    <span className="text-3xl block mb-2">🎉</span>
                    <p className="text-sm font-medium text-slate-600">No hay productos próximos a vencer</p>
                    <p className="text-xs text-slate-400 mt-1">Todos los lotes registrados cuentan con fechas vigentes.</p>
                  </div>
                ) : (
                  alertas.proximosAVencer.map((p) => {
                    const dias = Number(p.dias_restantes);
                    const urgente = dias <= 7;

                    return (
                      <div key={p.id_producto} className="py-4 flex items-center justify-between gap-4">
                        <div>
                          <h4 className="font-semibold text-slate-900 text-sm">{p.nombre}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Vence: <span className="font-medium text-slate-700">{new Date(p.fecha_vencimiento).toLocaleDateString('es-AR', { timeZone: 'UTC' })}</span>
                            {' · '}
                            <strong className={urgente ? 'text-red-600' : 'text-orange-600'}>
                              quedan {dias} {dias === 1 ? 'día' : 'días'}
                            </strong>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => navigate('/salidas')}
                          className="border border-[#0d825c] text-[#0d825c] hover:bg-emerald-50 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 cursor-pointer"
                        >
                          Registrar salida
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 mt-4 text-xs text-slate-400 flex items-center justify-between">
              <span>Priorizar en distribución de viandas</span>
              <button
                onClick={() => navigate('/salidas')}
                className="text-[#c2410c] font-semibold hover:underline"
              >
                + Dar salida a lotes próximos →
              </button>
            </div>
          </section>

        </div>
      )}

    </div>
  );
}
