// src/router/AppRouter.tsx
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useEffect } from "react";

// ── Layouts ─────────────────────────────────────────────────────────────────
import { MainLayout } from "./layouts/MainLayout";

// ── Páginas ─────────────────────────────────────────────────────────────────
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./components/auth/LoginPage";
import { RegisterPage } from "./components/auth/RegisterPage";
import { NotFoundPage } from "./pages/NotFoundPage";

// // Solicitudes
// import { SolicitudCreate } from "./pages/solicitudes/SolicitudCreate";
// import { MisSolicitudes } from "./pages/solicitudes/MisSolicitudes";

// // Asignaciones
import { AsignacionesPage } from "./pages/AsignacionPage";

// // Vehículos
import { MantenimientosPage } from "./pages/MantenimientoPage";
import { ReporteConsumoPage } from "./pages/ReporteConsumoPage";

// ── Store ───────────────────────────────────────────────────────────────────
import { useAuthStore } from "./store/authStore";
import { SolicitudesPage } from "./pages/SolicitudPage";
import { NuevaSolicitudPage } from "./pages/NuevaSolicitudPage";

// ── Tipos ───────────────────────────────────────────────────────────────────
type Rol =
  | "ADMINISTRADOR"
  | "SUPERVISOR"
  | "DELEGADO"
  | "PRESIDENTE_CONSEJO"
  | "CHOFER";

// ── Spinner de carga (estilo institucional) ─────────────────────────────────
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

// ── Guard: requiere sesión activa ───────────────────────────────────────────
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

// ── Guard: requiere uno de los roles permitidos ─────────────────────────────
const RoleRoute = ({ allowed }: { allowed: Rol[] }) => {
  const role = useAuthStore((s) => s.user?.rol) as Rol | undefined;

  // ADMINISTRADOR tiene acceso total
  if (role === "ADMINISTRADOR" || (role && allowed.includes(role))) {
    return <Outlet />;
  }
  return <Navigate to="/" replace />;
};

// ── Guard: rutas públicas (redirige si ya está autenticado) ─────────────────
const PublicRoute = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
};

// ── Router ───────────────────────────────────────────────────────────────────
const router = createBrowserRouter([
  // ── Rutas públicas ─────────────────────────────────────────────────────
  {
    path: "/",
    element: <MainLayout />,
    children: [{ index: true, element: <HomePage /> }],
  },

  // ── Autenticación (solo si NO está logueado) ───────────────────────────
  {
    element: <PublicRoute />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
    ],
  },

  // ── Rutas protegidas (requiere sesión) ─────────────────────────────────
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <MainLayout />,
        children: [
          // ── Solicitudes: Delegado, Presidente, Admin, Supervisor ───────
          {
            element: (
              <RoleRoute
                allowed={["SUPERVISOR", "DELEGADO", "PRESIDENTE_CONSEJO"]}
              />
            ),
            children: [
              {
                path: "solicitudes",
                children: [
                  { path: "crear", element: <NuevaSolicitudPage /> },
                  { path: "mis-solicitudes", element: <SolicitudesPage /> },
                ],
              },
            ],
          },

          // ── Asignaciones: Chofer, Admin, Supervisor ────────────────────
          {
            element: <RoleRoute allowed={["SUPERVISOR", "CHOFER"]} />,
            children: [{ path: "asignaciones", element: <AsignacionesPage /> }],
          },

          // ── Vehículos: Chofer, Admin, Supervisor ───────────────────────
          {
            element: <RoleRoute allowed={["SUPERVISOR", "CHOFER"]} />,
            children: [
              {
                path: "vehiculos",
                children: [
                  { path: "mantenimientos", element: <MantenimientosPage /> },
                  { path: "reportes-consumo", element: <ReporteConsumoPage /> },
                ],
              },
            ],
          },
        ],
      },
    ],
  },

  // ── 404 ────────────────────────────────────────────────────────────────
  { path: "*", element: <NotFoundPage /> },
]);

// ── Export ───────────────────────────────────────────────────────────────────
export const AppRouter = () => <RouterProvider router={router} />;
