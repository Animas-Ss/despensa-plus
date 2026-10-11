import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { usuario } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">📊 Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Bienvenido/a, <span className="font-semibold text-emerald-600">{usuario?.nombre}</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Módulo de Stock',       icon: '🗃️', desc: 'Consultá el inventario actual.',         href: '/stock' },
          { label: 'Registrar Donación',    icon: '🎁', desc: 'Ingresá nuevas entradas de productos.',  href: '/donaciones' },
          { label: 'Registrar Salida',      icon: '📤', desc: 'Registrá distribuciones de viandas.',    href: '/salidas' },
          { label: 'Catálogo de Productos', icon: '📦', desc: 'Administrá el catálogo general.',        href: '/productos' },
          { label: 'Alertas',               icon: '⚠️', desc: 'Revisá stock bajo y próximos vencimientos.', href: '/alertas' },
          { label: 'Reportes',              icon: '📈', desc: 'Consultá histórico de movimientos.',     href: '/reportes' },
        ].map(({ label, icon, desc, href }) => (
          <a
            key={href}
            href={href}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-5
                       hover:shadow-md hover:border-emerald-300 transition-all group"
          >
            <div className="text-3xl mb-3">{icon}</div>
            <h2 className="font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors">{label}</h2>
            <p className="text-xs text-slate-500 mt-1">{desc}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
