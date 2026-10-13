import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';

// Code Splitting con React.lazy para optimización de carga 4G (RNF04)
const Login             = lazy(() => import('./pages/Login'));
const Dashboard         = lazy(() => import('./pages/Dashboard'));
const Productos         = lazy(() => import('./pages/Productos'));
const RegistrarDonacion = lazy(() => import('./pages/RegistrarDonacion'));
const RegistrarSalida   = lazy(() => import('./pages/RegistrarSalida'));
const Alertas           = lazy(() => import('./pages/Alertas'));
const Reportes          = lazy(() => import('./pages/Reportes'));

// Fallback spinner elegante mientras carga el chunk
function PageLoading() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center">
      <div className="w-10 h-10 border-4 border-emerald-600/20 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
      <p className="text-sm font-medium text-slate-500">Cargando módulo...</p>
    </div>
  );
}

// Layout para rutas protegidas (Sidebar lateral Stitch UI + contenido)
function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#fbfbfa] text-slate-800 flex flex-col md:flex-row font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-grow">
          {children}
        </main>
        <footer className="bg-white/80 border-t border-slate-200 py-3 px-6 text-center text-xs text-slate-400">
          Despensa+ © 2026 — Comedor Comunitario "Manos que Alimentan" — Sector 7G
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageLoading />}>
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
              <Route path="/stock" element={
                <Navigate to="/productos" replace />
              } />
              <Route path="/donaciones" element={
                <AppLayout><RegistrarDonacion /></AppLayout>
              } />
              <Route path="/salidas" element={
                <AppLayout><RegistrarSalida /></AppLayout>
              } />
              <Route path="/alertas" element={
                <AppLayout><Alertas /></AppLayout>
              } />
              <Route path="/reportes" element={
                <AppLayout><Reportes /></AppLayout>
              } />
            </Route>

            {/* Redirect raíz */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
