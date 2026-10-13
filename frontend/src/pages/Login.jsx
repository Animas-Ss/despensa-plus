import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleFillDemo = () => {
    setForm({
      email: 'admin@despensaplus.com',
      password: 'admin123',
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Por favor completá tu correo y contraseña.');
      return;
    }
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al iniciar sesión. Verificá tus credenciales.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#f8fafc]">
      {/* ── Panel Izquierdo (Branding & Figma Visuals) ─────────────── */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-[#09372c] via-[#0e4a3b] to-[#135a47] text-white flex flex-col justify-center px-8 sm:px-14 lg:px-20 py-12 md:py-0 relative overflow-hidden">
        {/* Adorno visual sutil */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-lg">
          {/* Logo Despensa+ */}
          <div className="flex items-center gap-1 mb-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
              Despensa<span className="text-[#f59e0b] ml-0.5">+</span>
            </h1>
          </div>

          {/* Subtítulo */}
          <p className="text-lg sm:text-xl text-emerald-100/90 font-normal leading-relaxed mb-8">
            Donaciones y stock del comedor, en un solo lugar.
          </p>

          {/* Pastillas / Badges idénticos a Figma */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-[#fde9d2] text-[#7c2d12] shadow-sm">
              Donaciones
            </span>
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-[#fde9d2] text-[#7c2d12] shadow-sm">
              Stock
            </span>
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-[#cbf2de] text-[#065f46] shadow-sm">
              Reportes
            </span>
          </div>

          <p className="text-xs text-emerald-200/60 mt-12 hidden md:block">
            Comedor Comunitario "Manos que Alimentan" · Despensa+ © 2026
          </p>
        </div>
      </div>

      {/* ── Panel Derecho (Formulario de Login) ────────────────────── */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8 sm:p-10">
          
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
            Iniciar sesión
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Ingresá tus credenciales para acceder al sistema.
          </p>

          {/* Error Alert */}
          {error && (
            <div
              id="login-error"
              role="alert"
              className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-start gap-2 animate-shake"
            >
              <span className="text-base select-none">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Correo electrónico */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="nombre@comedor.org"
                autoComplete="email"
                disabled={loading}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder-slate-400
                           focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent
                           disabled:bg-slate-50 transition shadow-sm"
              />
            </div>

            {/* Contraseña */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="secretpassword"
                autoComplete="current-password"
                disabled={loading}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder-slate-400
                           focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent
                           disabled:bg-slate-50 transition shadow-sm"
              />
            </div>

            {/* Botón Ingresar */}
            <button
              id="btn-login"
              type="submit"
              disabled={loading}
              className="w-full bg-[#059669] hover:bg-[#047857] active:bg-[#065f46] disabled:bg-emerald-300
                         text-white font-semibold py-3.5 px-6 rounded-xl transition duration-150 ease-in-out
                         shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>Verificando...</span>
                </>
              ) : (
                'Ingresar'
              )}
            </button>
          </form>

          {/* Acceso Rápido / Credenciales Demo */}
          <div className="mt-8 pt-6 border-t border-slate-100 bg-slate-50/70 -mx-8 -mb-8 sm:-mx-10 sm:-mb-10 px-8 sm:px-10 py-5 rounded-b-3xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-700">Usuario de muestra:</p>
                <p className="text-xs text-slate-500 font-mono">admin@despensaplus.com / admin123</p>
              </div>
              <button
                type="button"
                onClick={handleFillDemo}
                className="text-xs font-medium text-emerald-700 hover:text-emerald-800 bg-emerald-100/70 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition"
              >
                Autocompletar
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
