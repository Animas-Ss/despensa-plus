import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import PanelAlertas from '../components/PanelAlertas';

export default function Dashboard() {
  const { usuario } = useAuth();
  const [metricas, setMetricas] = useState({
    totalProductos: 0,
    stockBajo: 0,
    agotados: 0,
    categorias: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarMetricas() {
      try {
        const { data } = await api.get('/api/productos');
        const productos = data.productos || [];
        const stockBajo = productos.filter(
          (p) => Number(p.stock_actual) > 0 && Number(p.stock_actual) <= Number(p.stock_minimo)
        ).length;
        const agotados = productos.filter((p) => Number(p.stock_actual) === 0).length;
        const categorias = new Set(productos.map((p) => p.categoria)).size;

        setMetricas({
          totalProductos: productos.length,
          stockBajo,
          agotados,
          categorias,
        });
      } catch (err) {
        console.error('Error cargando métricas en dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    cargarMetricas();
  }, []);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8" data-purpose="dashboard-view">
      
      {/* ── Header con Bienvenida y Acciones Rápidas ────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Panel</h1>
          <p className="text-sm text-slate-500 mt-1">
            Bienvenido/a, <span className="font-semibold text-emerald-700">{usuario?.nombre || 'Usuario'}</span> · Comedor "Manos que Alimentan"
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/donaciones"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0d825c] hover:bg-[#0a6b4c] text-white text-sm font-semibold shadow-xs transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Registrar donación</span>
          </Link>
          <Link
            to="/salidas"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#c2410c] hover:bg-[#9a3412] text-white text-sm font-semibold shadow-xs transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7" />
            </svg>
            <span>Registrar salida</span>
          </Link>
        </div>
      </div>

      {/* ── Tarjetas de Métricas Principales (Stitch UI) ─────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Métrica 1: Catálogo de Productos */}
        <div className="bg-white border-2 border-emerald-500/20 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-emerald-500 transition">
          <div className="flex items-center justify-between">
            <span className="text-3xl font-extrabold text-slate-900">
              {loading ? '...' : metricas.totalProductos}
            </span>
            <span className="w-10 h-10 rounded-full bg-emerald-100/80 flex items-center justify-center text-emerald-700">
              📦
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-4">Productos en catálogo</p>
        </div>

        {/* Métrica 2: Con stock bajo */}
        <div className="bg-white border-2 border-amber-500/20 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-amber-500 transition">
          <div className="flex items-center justify-between">
            <span className="text-3xl font-extrabold text-amber-700">
              {loading ? '...' : metricas.stockBajo}
            </span>
            <span className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
              ⚠️
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-4">Con stock bajo</p>
        </div>

        {/* Métrica 3: Agotados */}
        <div className="bg-white border-2 border-orange-500/20 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-orange-500 transition">
          <div className="flex items-center justify-between">
            <span className="text-3xl font-extrabold text-orange-700">
              {loading ? '...' : metricas.agotados}
            </span>
            <span className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-700">
              ⏳
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-4">Productos agotados</p>
        </div>

        {/* Métrica 4: Categorías */}
        <div className="bg-white border-2 border-emerald-500/20 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-emerald-500 transition">
          <div className="flex items-center justify-between">
            <span className="text-3xl font-extrabold text-slate-900">
              {loading ? '...' : metricas.categorias}
            </span>
            <span className="w-10 h-10 rounded-full bg-emerald-100/80 flex items-center justify-center text-emerald-700">
              🏷️
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-4">Categorías activas</p>
        </div>

      </div>

      {/* ── Panel de Alertas Críticas ──────────────────────────────── */}
      <PanelAlertas />

      {/* ── Módulos y Accesos Directos ───────────────────────────────── */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Accesos directos del sistema</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              to: '/productos',
              label: 'Stock y Catálogo',
              desc: 'Consultá y administrá el inventario completo de alimentos e insumos.',
              icon: '📦',
              tag: 'Disponible',
              tagClass: 'bg-emerald-100 text-emerald-800',
            },
            {
              to: '/donaciones',
              label: 'Registrar Donación',
              desc: 'Cargá ingresos de alimentos con cálculo automático de stock.',
              icon: '🎁',
              tag: 'Disponible',
              tagClass: 'bg-emerald-100 text-emerald-800',
            },
            {
              to: '/salidas',
              label: 'Registrar Salida',
              desc: 'Descontá raciones para viandas o meriendas comunitarias.',
              icon: '📤',
              tag: 'Disponible',
              tagClass: 'bg-emerald-100 text-emerald-800',
            },
            {
              to: '/alertas',
              label: 'Alertas de Stock y Vencimientos',
              desc: 'Visualizá productos bajo stock mínimo y próximos a vencer.',
              icon: '🔔',
              tag: 'Disponible',
              tagClass: 'bg-emerald-100 text-emerald-800',
            },
            {
              to: '/reportes',
              label: 'Reportes y Métricas',
              desc: 'Resúmenes periódicos de donaciones, consumos y saldo con exportación a imprimir.',
              icon: '📈',
              tag: 'Disponible',
              tagClass: 'bg-emerald-100 text-emerald-800',
            },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs hover:shadow-md hover:border-emerald-300 transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{item.icon}</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${item.tagClass}`}>
                    {item.tag}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 group-hover:text-emerald-700 transition">
                  {item.label}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  {item.desc}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-700 group-hover:translate-x-0.5 transition">
                <span>Ingresar al módulo</span>
                <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
