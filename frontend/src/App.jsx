import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import Login     from './pages/Login';
import Dashboard from './pages/Dashboard';
import Productos from './pages/Productos';

// Layout para rutas protegidas (Navbar + contenido)
function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <footer className="bg-white border-t border-slate-200 py-3 px-6 text-center text-xs text-slate-400">
        Despensa+ © 2026 — Comedor Comunitario "Manos que Alimentan" — Sector 7G
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Pública */}
          <Route path="/login" element={<Login />} />

          {/* Protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={
              <AppLayout><Dashboard /></AppLayout>
            } />
            <Route path="/productos" element={
              <AppLayout><Productos /></AppLayout>
            } />
            {/* Rutas futuras (Días 6-12) */}
            <Route path="/donaciones" element={<AppLayout><div className="p-8 text-slate-400">Módulo en construcción — Día 6/7</div></AppLayout>} />
            <Route path="/salidas"    element={<AppLayout><div className="p-8 text-slate-400">Módulo en construcción — Día 9/10</div></AppLayout>} />
            <Route path="/stock"      element={<AppLayout><div className="p-8 text-slate-400">Módulo en construcción — Día 8</div></AppLayout>} />
            <Route path="/alertas"    element={<AppLayout><div className="p-8 text-slate-400">Módulo en construcción — Día 11</div></AppLayout>} />
            <Route path="/reportes"   element={<AppLayout><div className="p-8 text-slate-400">Módulo en construcción — Día 12</div></AppLayout>} />
          </Route>

          {/* Redirect raíz */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
