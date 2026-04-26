// src/layouts/MainLayout.tsx
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  Sun,
  Moon,
  LogOut,
  LogIn,
  Home,
  Menu,
  X,
  FileText,
  Fuel,
  Truck,
  Map,
  Building2,
  BarChart3,
} from "lucide-react";
import { useState } from "react";
import { useAppStore } from "../store/appStore";
import { useAuthStore } from "../store/authStore";

// ── Tipos ────────────────────────────────────────────────────────────────────
type Rol =
  | "ADMINISTRADOR"
  | "SUPERVISOR"
  | "DELEGADO"
  | "PRESIDENTE_CONSEJO"
  | "CHOFER";

interface NavLinkItem {
  to: string;
  label: string;
  Icon: React.ElementType;
  roles?: Rol[]; // undefined = visible para todos (con o sin sesión)
}

// ── Links — roles coinciden con ROUTE_ROLES del AppRouter ───────────────────
//   roles: undefined  → visible siempre (incluso sin sesión)
//   roles: [...]      → visible solo si el usuario tiene uno de esos roles
//   ADMINISTRADOR siempre ve todo — se añade en el filtro
const NAV_LINKS: NavLinkItem[] = [
  {
    to: "/",
    label: "Inicio",
    Icon: Home,
    // Sin roles → visible para todos
  },
  {
    to: "/solicitudes",
    label: "Solicitudes",
    Icon: FileText,
    roles: ["ADMINISTRADOR", "SUPERVISOR", "DELEGADO", "PRESIDENTE_CONSEJO"],
  },
  {
    to: "/tanques",
    label: "Tanques",
    Icon: Fuel,
    roles: ["ADMINISTRADOR", "SUPERVISOR"],
  },
  {
    to: "/vehiculos",
    label: "Vehículos",
    Icon: Truck,
    roles: ["ADMINISTRADOR", "SUPERVISOR", "CHOFER"],
  },
  {
    to: "/rutas",
    label: "Rutas",
    Icon: Map,
    roles: ["ADMINISTRADOR", "SUPERVISOR"],
  },
  {
    to: "/consejos-populares",
    label: "Consejos",
    Icon: Building2,
    roles: ["ADMINISTRADOR"],
  },
  {
    to: "/reportes",
    label: "Reportes",
    Icon: BarChart3,
    roles: ["ADMINISTRADOR", "SUPERVISOR", "CHOFER"],
  },
];

// ── MainLayout ───────────────────────────────────────────────────────────────
export const MainLayout = () => {
  const { theme, toggleTheme } = useAppStore();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const rol = user?.rol as Rol | undefined;
  const isDark = theme === "dark";

  // Un link es visible si:
  // - no tiene roles definidos (público), o
  // - el usuario es ADMINISTRADOR (acceso total), o
  // - el rol del usuario está en la lista del link
  const visibleLinks = NAV_LINKS.filter(
    ({ roles }) =>
      !roles || rol === "ADMINISTRADOR" || (rol && roles.includes(rol)),
  );

  const handleAuthAction = () => {
    if (isAuthenticated) logout();
    else navigate("/login");
  };

  return (
    <div
      className={`min-h-screen font-['Sora',sans-serif] transition-colors duration-300 ${
        isDark ? "dark bg-[#0b1220] text-white" : "bg-[#f0f3fa] text-[#0e1f4d]"
      }`}
    >
      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <header
        className={`sticky top-0 z-50 transition-colors duration-300 ${
          isDark
            ? "bg-[#0e1a35] shadow-[0_2px_24px_rgba(0,0,0,0.5)]"
            : "bg-[#1B3D8F] shadow-[0_2px_24px_rgba(27,61,143,0.35)]"
        }`}
      >
        {/* Barra tricolor */}
        <div className="flex h-1" aria-hidden="true">
          <span className="flex-1 bg-[#CC1A2E]" />
          <span className="w-px bg-white/30" />
          <span className="flex-1 bg-white/20" />
        </div>

        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
          {/* Marca izquierda */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div
              aria-hidden="true"
              className="h-7 w-7 shrink-0 bg-[#CC1A2E] transition-transform duration-300 group-hover:scale-110"
              style={{
                clipPath:
                  "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)",
              }}
            />
            <div className="hidden sm:block">
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/50 leading-none">
                República de Cuba
              </p>
              <p className="text-[13px] font-bold text-white leading-tight">
                Asamblea Municipal
              </p>
            </div>
          </Link>

          {/* Nav central — desktop */}
          <nav
            aria-label="Navegación principal"
            className="hidden md:flex items-center gap-1"
          >
            {visibleLinks.map(({ to, label, Icon }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`relative flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[13px] font-semibold transition-all duration-200 ${
                    active
                      ? "bg-white/15 text-white"
                      : "text-white/65 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon size={14} strokeWidth={2.5} aria-hidden="true" />
                  {label}
                  {active && (
                    <span className="absolute bottom-0.5 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-[#CC1A2E]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Controles derecha */}
          <div className="flex items-center gap-2">
            {/* Info usuario — solo si hay sesión, desktop */}
            {isAuthenticated && user && (
              <div className="hidden sm:flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#CC1A2E] text-[10px] font-bold text-white uppercase">
                  {user.nombre?.[0] ?? "U"}
                </div>
                <div className="leading-none">
                  <p className="text-[12px] font-semibold text-white">
                    {user.nombre} {user.apellidos}
                  </p>
                  <p className="text-[10px] text-white/50 capitalize">
                    {user.rol?.toLowerCase().replace("_", " ") ?? "usuario"}
                  </p>
                </div>
              </div>
            )}

            {/* Toggle tema */}
            <button
              onClick={toggleTheme}
              aria-label={
                isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
              }
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white/70 transition-all duration-200 hover:bg-white/20 hover:text-white"
            >
              {isDark ? (
                <Sun size={15} strokeWidth={2} aria-hidden="true" />
              ) : (
                <Moon size={15} strokeWidth={2} aria-hidden="true" />
              )}
            </button>

            {/* Botón Login / Salir — desktop */}
            <button
              onClick={handleAuthAction}
              aria-label={isAuthenticated ? "Cerrar sesión" : "Iniciar sesión"}
              className={`hidden sm:flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold text-white transition-all duration-200 ${
                isAuthenticated
                  ? "bg-[#CC1A2E]/80 hover:bg-[#CC1A2E] hover:shadow-[0_0_12px_rgba(204,26,46,0.4)]"
                  : "bg-white/15 hover:bg-white/25"
              }`}
            >
              {isAuthenticated ? (
                <>
                  <LogOut size={13} strokeWidth={2.5} aria-hidden="true" />{" "}
                  Salir
                </>
              ) : (
                <>
                  <LogIn size={13} strokeWidth={2.5} aria-hidden="true" />{" "}
                  Iniciar sesión
                </>
              )}
            </button>

            {/* Hamburger — mobile */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={mobileOpen}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white md:hidden"
            >
              {mobileOpen ? (
                <X size={16} aria-hidden="true" />
              ) : (
                <Menu size={16} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Menú mobile */}
        {mobileOpen && (
          <nav
            aria-label="Menú móvil"
            className={`border-t px-4 py-3 md:hidden ${
              isDark
                ? "border-white/10 bg-[#0e1a35]"
                : "border-white/20 bg-[#1B3D8F]"
            }`}
          >
            <div className="flex flex-col gap-1">
              {visibleLinks.map(({ to, label, Icon }) => {
                const active = location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-[13px] font-semibold transition-all ${
                      active
                        ? "bg-white/15 text-white"
                        : "text-white/65 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon size={14} strokeWidth={2.5} aria-hidden="true" />
                    {label}
                  </Link>
                );
              })}

              <div className="my-1 h-px bg-white/10" aria-hidden="true" />

              {/* Usuario mobile */}
              {isAuthenticated && user && (
                <div className="flex items-center gap-2 px-3 py-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#CC1A2E] text-[10px] font-bold text-white uppercase">
                    {user.nombre?.[0] ?? "U"}
                  </div>
                  <div className="leading-none">
                    <p className="text-[12px] font-semibold text-white">
                      {user.nombre} {user.apellidos}
                    </p>
                    <p className="text-[10px] text-white/50 capitalize">
                      {user.rol?.toLowerCase().replace("_", " ") ?? "usuario"}
                    </p>
                  </div>
                </div>
              )}

              {/* Botón Login / Salir — mobile */}
              <button
                onClick={() => {
                  handleAuthAction();
                  setMobileOpen(false);
                }}
                className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-[13px] font-semibold text-white transition-all ${
                  isAuthenticated
                    ? "bg-[#CC1A2E]/80 hover:bg-[#CC1A2E]"
                    : "bg-white/15 hover:bg-white/25"
                }`}
              >
                {isAuthenticated ? (
                  <>
                    <LogOut size={14} strokeWidth={2.5} aria-hidden="true" />{" "}
                    Cerrar sesión
                  </>
                ) : (
                  <>
                    <LogIn size={14} strokeWidth={2.5} aria-hidden="true" />{" "}
                    Iniciar sesión
                  </>
                )}
              </button>
            </div>
          </nav>
        )}
      </header>

      {/* ── Contenido ───────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
};
