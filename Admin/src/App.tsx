// src/router/AppRouter.tsx
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useEffect } from "react";
import { MainLayout } from "./layouts/MainLayout";

// ── Páginas ──────────────────────────────────────────────────────────────────
import { LoginPage } from "./components/auth/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { DashboardPage } from "./pages/DashboardPage";
// import { SolicitudesPage }       from "./pages/SolicitudesPage";
// import { TanquesPage }           from "./pages/TanquesPage";
// import { VehiculosPage }         from "./pages/VehiculosPage";
// import { RutasPage }             from "./pages/RutasPage";
import { ConsejosPopularesPage } from "./pages/ConsejosPopularesPage";
import { CircunscripcionPage } from "./pages/CircunscripcionPage";
// import { ReportesPage }          from "./pages/ReportesPage";

import { useAuthStore } from "./store/authStore";
import { ZonasPage } from "./pages/ZonasPage";
import { CdrsPage } from "./pages/CdrPage";
import { UsuariosPage } from "./pages/UsuariosPage";
import { TipoCombustiblePage } from "./pages/TipoCombustiblePage";
// import { InventarioMovimientosPage } from "./pages/InventarioMovimientoPage";
import { InventarioPage } from "./pages/InventarioPage";
import { MovimientosCombustiblePage } from "./pages/MovimientosCombustiblePage";

// ── Spinner ───────────────────────────────────────────────────────────────────
const AuthSpinner = () => (
  <div
    role="status"
    aria-label="Verificando sesión"
    className="flex min-h-screen items-center justify-center bg-[#1B3D8F]"
  >
    <div className="flex flex-col items-center gap-4">
      <div
        className="h-10 w-10 animate-spin bg-white"
        style={{
          clipPath:
            "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)",
          animationDuration: "1.2s",
          animationTimingFunction: "linear",
        }}
        aria-hidden="true"
      />
      <p
        className="text-[13px] font-semibold uppercase tracking-widest text-white/70"
        style={{ fontFamily: "'Sora', sans-serif" }}
      >
        Verificando sesión…
      </p>
    </div>
  </div>
);

// ── Guard: requiere sesión activa ─────────────────────────────────────────────
const ProtectedRoute = () => {
  const me = useAuthStore((s) => s.me);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    me();
  }, [me]);

  if (isLoading) return <AuthSpinner />;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// ── Guard: rutas públicas ─────────────────────────────────────────────────────
const PublicRoute = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

// ── Router ────────────────────────────────────────────────────────────────────
const router = createBrowserRouter([
  // ── Autenticación (solo sin sesión) ──
  {
    element: <PublicRoute />,
    children: [{ path: "/login", element: <LoginPage /> }],
  },

  // ── Rutas protegidas ──
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <MainLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },

          { path: "dashboard", element: <DashboardPage /> },
          { path: "usuarios", element: <UsuariosPage /> },
          // { path: "solicitudes",       element: <SolicitudesPage /> },
          // { path: "tanques",           element: <TanquesPage /> },
          // { path: "vehiculos",         element: <VehiculosPage /> },
          // { path: "rutas",             element: <RutasPage /> },
          { path: "consejos", element: <ConsejosPopularesPage /> },
          {
            path: "circunscripciones",
            element: <CircunscripcionPage />,
          },
          { path: "zonas", element: <ZonasPage /> },
          { path: "cdrs", element: <CdrsPage /> },
          { path: "combustible/tipo", element: <TipoCombustiblePage /> },
          { path: "combustible/inventario", element: <InventarioPage /> },
          // {
          //   path: "combustible/movimientos",
          //   element: <InventarioMovimientosPage inventarioId="" />,
          // },
          {
            path: "combustible/movimientos",
            element: <MovimientosCombustiblePage />,
          },

          // { path: "reportes",          element: <ReportesPage /> },
        ],
      },
    ],
  },

  { path: "*", element: <NotFoundPage /> },
]);

// ── Provider ──────────────────────────────────────────────────────────────────
export const AppRouter = () => <RouterProvider router={router} />;
