// src/router/AppRouter.tsx
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useEffect, useRef } from "react";
import { MainLayout } from "./layouts/MainLayout";

// ── Páginas ─────────────────────────────────────────────────────────────────
import { HomePage }             from "./pages/HomePage";
import { LoginPage }            from "./components/auth/LoginPage";
import { RegisterPage }         from "./components/auth/RegisterPage";
import { NotFoundPage }         from "./pages/NotFoundPage";
// import { SolicitudesPage }      from "./pages/SolicitudesPage";
// import { TanquesPage }          from "./pages/TanquesPage";
// import { VehiculosPage }        from "./pages/VehiculosPage";
// import { RutasPage }            from "./pages/RutasPage";
// import { ConsejosPopularesPage} from "./pages/ConsejosPopularesPage";
// import { ReportesPage }         from "./pages/ReportesPage";

import { useAuthStore } from "./store/authStore";

// ── Roles ────────────────────────────────────────────────────────────────────
type Rol = "ADMINISTRADOR" | "SUPERVISOR" | "DELEGADO" | "PRESIDENTE_CONSEJO" | "CHOFER";

// Permisos por ruta — quién puede acceder a cada path
const ROUTE_ROLES: Record<string, Rol[]> = {
  "/solicitudes":       ["ADMINISTRADOR", "SUPERVISOR", "DELEGADO", "PRESIDENTE_CONSEJO"],
  "/tanques":           ["ADMINISTRADOR", "SUPERVISOR"],
  "/vehiculos":         ["ADMINISTRADOR", "SUPERVISOR", "CHOFER"],
  "/rutas":             ["ADMINISTRADOR", "SUPERVISOR"],
  "/consejos-populares":["ADMINISTRADOR"],
  "/reportes":          ["ADMINISTRADOR", "SUPERVISOR", "CHOFER"],
};

// ── Spinner de carga ─────────────────────────────────────────────────────────
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

// ── Guard: requiere sesión activa ────────────────────────────────────────────
const ProtectedRoute = () => {
  const me              = useAuthStore((s) => s.me);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading       = useAuthStore((s) => s.isLoading);
  const hasFetched      = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      me();
    }
  }, [me]);

  if (isLoading) return <AuthSpinner />;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// ── Guard: requiere uno de los roles permitidos ──────────────────────────────
// Si el usuario está autenticado pero no tiene el rol → redirige a /
const RoleRoute = ({ allowed }: { allowed: Rol[] }) => {
  const role = useAuthStore((s) => s.user?.rol) as Rol | undefined;
  // ADMINISTRADOR siempre pasa — tiene acceso total
  if (role === "ADMINISTRADOR" || (role && allowed.includes(role))) {
    return <Outlet />;
  }
  return <Navigate to="/" replace />;
};

// ── Guard: rutas públicas ────────────────────────────────────────────────────
// Con sesión activa → redirige a /
const PublicRoute = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
};

// ── Router ───────────────────────────────────────────────────────────────────
const router = createBrowserRouter([
  // ── Pública y libre — la única sin sesión requerida ──
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
    ],
  },

  // ── Autenticación ──
  {
    element: <PublicRoute />,
    children: [
      { path: "/login",    element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
    ],
  },

  // ── Rutas protegidas (sesión requerida) ──
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <MainLayout />,
        children: [

          // TODOS los roles autenticados
          {
            element: <RoleRoute allowed={ROUTE_ROLES["/solicitudes"]} />,
            children: [
              // { path: "solicitudes", element: <SolicitudesPage /> },
            ],
          },

          // ADMINISTRADOR + SUPERVISOR + CHOFER
          {
            element: <RoleRoute allowed={ROUTE_ROLES["/vehiculos"]} />,
            children: [
              // { path: "vehiculos", element: <VehiculosPage /> },
            ],
          },

          // ADMINISTRADOR + SUPERVISOR + CHOFER
          {
            element: <RoleRoute allowed={ROUTE_ROLES["/reportes"]} />,
            children: [
              // { path: "reportes", element: <ReportesPage /> },
            ],
          },

          // ADMINISTRADOR + SUPERVISOR
          {
            element: <RoleRoute allowed={ROUTE_ROLES["/tanques"]} />,
            children: [
              // { path: "tanques", element: <TanquesPage /> },
            ],
          },

          // ADMINISTRADOR + SUPERVISOR
          {
            element: <RoleRoute allowed={ROUTE_ROLES["/rutas"]} />,
            children: [
              // { path: "rutas", element: <RutasPage /> },
            ],
          },

          // Solo ADMINISTRADOR (RoleRoute lo bloquea para el resto)
          {
            element: <RoleRoute allowed={ROUTE_ROLES["/consejos-populares"]} />,
            children: [
              // { path: "consejos-populares", element: <ConsejosPopularesPage /> },
            ],
          },

        ],
      },
    ],
  },

  { path: "*", element: <NotFoundPage /> },
]);

// ── Provider ─────────────────────────────────────────────────────────────────
export const AppRouter = () => <RouterProvider router={router} />;