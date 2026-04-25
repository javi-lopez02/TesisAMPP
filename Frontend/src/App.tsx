// src/router/AppRouter.tsx
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useEffect, useRef } from "react";
import { MainLayout } from "./layouts/MainLayout";
import { HomePage } from "./pages/HomePage";
import { DashboardPage } from "./pages/DashboardPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { LoginPage } from "./components/auth/LoginPage";
import { RegisterPage } from "./components/auth/RegisterPage";
import { useAuthStore } from "./store/authStore";

// ── Spinner de carga ────────────────────────────────────────────────────────
const AuthSpinner = () => (
  <div
    role="status"
    aria-label="Verificando sesión"
    className="flex min-h-screen items-center justify-center bg-[#1B3D8F]"
  >
    <div className="flex flex-col items-center gap-4">
      {/* Estrella cubana giratoria */}
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
        className="text-[13px] font-semibold tracking-widest text-white/70 uppercase"
        style={{ fontFamily: "'Sora', sans-serif" }}
      >
        Verificando sesión…
      </p>
    </div>
  </div>
);

// ── Guard: rutas protegidas ─────────────────────────────────────────────────
// MEJORA: un solo useAuthStore() por componente; hasFetched evita llamar me()
// en cada re-render y en cada navegación interna
const ProtectedRoute = () => {
  const me = useAuthStore((s) => s.me);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  // MEJORA: ref en lugar de estado para no provocar re-render extra
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      me();
    }
  }, [me]);

  // Mientras se verifica la sesión → spinner
  if (isLoading) return <AuthSpinner />;

  // Sesión inválida → redirigir al login
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// ── Guard: rutas públicas ───────────────────────────────────────────────────
// MEJORA: componente separado y limpio; no necesita llamar a me()
// porque ProtectedRoute ya lo hace al entrar al área privada
const PublicRoute = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

// ── Definición del router ───────────────────────────────────────────────────
// MEJORA: definir el router fuera del componente para que no se recree
// en cada render de AppRouter
const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      // Rutas protegidas agrupadas bajo un único guard
      {
        element: <ProtectedRoute />,
        children: [
          { path: "dashboard", element: <DashboardPage /> },
          // Agrega aquí futuras rutas privadas sin repetir el guard
        ],
      },
    ],
  },
  // Rutas públicas agrupadas bajo un único guard
  {
    element: <PublicRoute />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);

// ── Provider ────────────────────────────────────────────────────────────────
export const AppRouter = () => <RouterProvider router={router} />;
