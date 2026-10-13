import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function PanelAlertas() {
  const [alertas, setAlertas] = useState({ stockBajo: [], proximosAVencer: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAlertas() {
      try {
        const { data } = await api.get('/api/alertas');
        setAlertas({
          stockBajo: data.stockBajo || [],
          proximosAVencer: data.proximosAVencer || [],
        });
      } catch (err) {
        console.error('Error cargando alertas para panel:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAlertas();
  }, []);

  const totalAlertas = alertas.stockBajo.length + alertas.proximosAVencer.length;

  if (loading) return null;
  if (totalAlertas === 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-5 flex items-center justify-between text-emerald-800">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <p className="font-semibold text-sm">Inventario en estado óptimo</p>
            <p className="text-xs text-emerald-700/80">No hay productos con stock crítico ni vencimientos urgentes en los próximos 30 días.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center text-xl">
            ⚠️
          </span>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Alertas del Comedor ({totalAlertas} requeridas de atención)
            </h3>
            <p className="text-xs text-slate-600">
              {alertas.stockBajo.length > 0 && `${alertas.stockBajo.length} con stock bajo/agotado.`}{' '}
              {alertas.proximosAVencer.length > 0 && `${alertas.proximosAVencer.length} próximos a vencer.`}
            </p>
          </div>
        </div>
        <Link
          to="/alertas"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
        >
          <span>Ver todas las alertas</span>
          <span>→</span>
        </Link>
      </div>

      {/* Preview de items más críticos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
        {alertas.stockBajo.slice(0, 3).map((item) => (
          <div
            key={`stock-${item.id_producto}`}
            className="bg-white border border-amber-200/70 rounded-xl p-3 flex items-center justify-between shadow-2xs"
          >
            <div>
              <p className="text-xs font-bold text-slate-800">{item.nombre}</p>
              <p className="text-2xs text-slate-500">{item.categoria}</p>
            </div>
            <div className="text-right">
              <span
                className={`inline-block text-2xs font-bold px-2 py-0.5 rounded-full ${
                  Number(item.stock_actual) === 0
                    ? 'bg-red-100 text-red-700'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {Number(item.stock_actual) === 0 ? 'Agotado' : `${item.stock_actual} ${item.unidad}`}
              </span>
            </div>
          </div>
        ))}

        {alertas.proximosAVencer.slice(0, 3).map((item) => (
          <div
            key={`vence-${item.id_producto}`}
            className="bg-white border border-orange-200/70 rounded-xl p-3 flex items-center justify-between shadow-2xs"
          >
            <div>
              <p className="text-xs font-bold text-slate-800">{item.nombre}</p>
              <p className="text-2xs text-slate-500">Vence en {item.dias_restantes} días</p>
            </div>
            <div className="text-right">
              <span className="inline-block text-2xs font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                Próx. vencimiento
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
