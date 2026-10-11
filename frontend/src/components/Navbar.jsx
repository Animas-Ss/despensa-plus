import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { to: '/dashboard',  label: 'Dashboard',   icon: '📊' },
  { to: '/productos',  label: 'Catálogo',     icon: '📦' },
  { to: '/donaciones', label: 'Donaciones',   icon: '🎁' },
  { to: '/salidas',    label: 'Salidas',      icon: '📤' },
  { to: '/stock',      label: 'Stock',        icon: '🗃️' },
  { to: '/reportes',   label: 'Reportes',     icon: '📈' },
];

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="bg-emerald-700 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl tracking-tight hover:text-emerald-200 transition-colors">
            🏠 Despensa+
          </Link>

          {/* Navegación central */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label, icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                  ${pathname.startsWith(to)
                    ? 'bg-emerald-600 text-white'
                    : 'text-emerald-100 hover:bg-emerald-600/60'}`}
              >
                <span>{icon}</span>
                {label}
              </Link>
            ))}
          </nav>

          {/* Usuario + Logout */}
          <div className="flex items-center gap-3">
            {usuario && (
              <div className="hidden sm:flex flex-col items-end leading-tight">
                <span className="text-sm font-semibold">{usuario.nombre}</span>
                <span className="text-xs text-emerald-200 capitalize">{usuario.rol}</span>
              </div>
            )}
            <button
              id="btn-logout"
              onClick={handleLogout}
              className="bg-emerald-600 hover:bg-red-600 text-white text-sm font-medium px-3 py-1.5 rounded-md transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
