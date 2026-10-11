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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Completá todos los campos.');
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-slate-100 px-4">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

          {/* Header de la card */}
          <div className="bg-emerald-700 px-8 py-7 text-white">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-3xl">🏠</span>
              <h1 className="text-2xl font-bold tracking-tight">Despensa+</h1>
            </div>
            <p className="text-emerald-200 text-sm">
              Comedor Comunitario "Manos que Alimentan"
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5" noValidate>
            <div>
              <h2 className="text-lg font-semibold text-slate-800 mb-1">Iniciar sesión</h2>
              <p className="text-sm text-slate-500">Ingresá con tu cuenta autorizada.</p>
            </div>

            {/* Error */}
            {error && (
              <div
                id="login-error"
                role="alert"
                className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3"
              >
                ⚠️ {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="admin@despensaplus.com"
                autoComplete="email"
                disabled={loading}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-800
                           focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                           disabled:bg-slate-50 transition"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={loading}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-800
                           focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                           disabled:bg-slate-50 transition"
              />
            </div>

            {/* Submit */}
            <button
              id="btn-login"
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400
                         text-white font-semibold py-2.5 rounded-lg transition-colors
                         flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin text-lg">⏳</span>
                  Verificando...
                </>
              ) : (
                'Ingresar'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-5">
          Despensa+ © 2026 — Sector 7G
        </p>
      </div>
    </div>
  );
}
