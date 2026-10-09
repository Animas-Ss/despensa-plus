import { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.API_URL || 'http://localhost:5000';

export default function App() {
  const [healthStatus, setHealthStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/health`)
      .then((res) => res.json())
      .then((data) => {
        setHealthStatus(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error al conectar con la API:', err);
        setHealthStatus({ status: 'error', message: `Servidor API fuera de línea (${API_BASE_URL})` });
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-100 text-slate-800">
      {/* Header */}
      <header className="bg-emerald-600 text-white shadow-md py-4 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="text-2xl font-bold tracking-tight">Despensa+</span>
            <span className="bg-emerald-700 text-emerald-100 text-xs px-2.5 py-0.5 rounded-full font-medium">
              v1.0.0
            </span>
          </div>
          <p className="text-emerald-100 text-sm hidden sm:block">
            Comedor Comunitario "Manos que Alimentan"
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto w-full px-4 py-8 flex-grow">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Configuración Inicial Exitosa</h1>
              <p className="text-slate-500 text-sm">Entorno de Frontend y Backend vinculados</p>
            </div>
          </div>

          <p className="text-slate-600 mb-6 leading-relaxed">
            La estructura base del proyecto se ha preparado respondiendo al modelo de componentes y la arquitectura en capas.
          </p>

          {/* Estado de conexión Backend */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
            <h2 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <span>Estado del Servidor API Backend:</span>
              {loading ? (
                <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-xs">Conectando...</span>
              ) : healthStatus?.status === 'ok' ? (
                <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs font-semibold">Online (HTTP 200)</span>
              ) : (
                <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded text-xs font-semibold">Offline</span>
              )}
            </h2>

            {loading ? (
              <p className="text-xs text-slate-500 animate-pulse">Verificando {API_BASE_URL}/api/health...</p>
            ) : (
              <div className="text-xs font-mono bg-slate-900 text-slate-100 p-3 rounded overflow-x-auto">
                {JSON.stringify(healthStatus, null, 2)}
              </div>
            )}
          </div>
        </div>

        {/* Info del Equipo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-1">Módulo Backend (/backend)</h3>
            <p className="text-xs text-slate-500">Node.js + Express REST API en puerto 5000</p>
          </div>
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-1">Módulo Frontend (/frontend)</h3>
            <p className="text-xs text-slate-500">React + Vite + Tailwind CSS</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500">
        Despensa+ &copy; 2026 - Desarrollado por Sector 7G (Sebastián Sosa & Carlos Gez)
      </footer>
    </div>
  );
}
