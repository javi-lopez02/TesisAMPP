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
  ClipboardList,
  Truck,
  Wrench,
  Droplet,
  ChevronDown,
  Plus,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAppStore } from "../store/appStore";
import { useAuthStore } from "../store/authStore";
// import { Toaster } from "sonner";

// ── Tipos ─────────────────────────────────────────────────────────────────────
type Rol =
  | "ADMINISTRADOR"
  | "SUPERVISOR"
  | "DELEGADO"
  | "PRESIDENTE_CONSEJO"
  | "CHOFER";

interface DropdownItem {
  to: string;
  label: string;
  Icon: React.ElementType;
  roles?: Rol[]; // undefined = visible para todos los roles con acceso al padre
}

interface NavItem {
  to?: string;
  label: string;
  Icon: React.ElementType;
  dropdown?: DropdownItem[];
  roles?: Rol[]; // undefined = público
}

// ── Estructura de navegación (simplificada + roles) ───────────────────────────
const NAV_ITEMS: NavItem[] = [
  {
    to: "/",
    label: "Inicio",
    Icon: Home,
    // Sin roles = público
  },
  {
    label: "Solicitudes",
    Icon: FileText,
    roles: ["ADMINISTRADOR", "SUPERVISOR", "DELEGADO", "PRESIDENTE_CONSEJO"],
    dropdown: [
      { to: "/solicitudes/crear", label: "Crear solicitud", Icon: Plus },
      {
        to: "/solicitudes/mis-solicitudes",
        label: "Mis solicitudes",
        Icon: ClipboardList,
      },
    ],
  },
  {
    to: "/asignaciones",
    label: "Asignaciones",
    Icon: ClipboardList,
    roles: ["ADMINISTRADOR", "SUPERVISOR", "CHOFER"],
  },
  {
    label: "Vehículos",
    Icon: Truck,
    roles: ["ADMINISTRADOR", "SUPERVISOR", "CHOFER"],
    dropdown: [
      {
        to: "/vehiculos/mantenimientos",
        label: "Mantenimientos",
        Icon: Wrench,
      },
      {
        to: "/vehiculos/reportes-consumo",
        label: "Reportes de consumo",
        Icon: Droplet,
      },
    ],
  },
];

// ── Helper: verificar visibilidad por rol ─────────────────────────────────────
const isVisibleByRole = (
  roles: Rol[] | undefined,
  currentRol: Rol | undefined,
): boolean => {
  if (!roles) return true; // público
  if (currentRol === "ADMINISTRADOR") return true; // admin ve todo
  return !!currentRol && roles.includes(currentRol);
};

// ── Helper: verificar si un dropdown tiene al menos un item visible ───────────
const hasVisibleDropdownItems = (
  items: DropdownItem[],
  currentRol: Rol | undefined,
): boolean => {
  return items.some((item) => isVisibleByRole(item.roles, currentRol));
};

// ── Hook: cierra el dropdown al hacer click fuera ─────────────────────────────
const useClickOutside = (
  ref: React.RefObject<HTMLDivElement>,
  onClose: () => void,
) => {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onClose]);
};

// ── DropdownMenu (desktop) ────────────────────────────────────────────────────
const DropdownMenu = ({
  item,
  isDark,
  currentRol,
}: {
  item: NavItem;
  isDark: boolean;
  currentRol: Rol | undefined;
}) => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null!);
  useClickOutside(ref, () => setOpen(false));

  // Filtrar items del dropdown por rol
  const visibleItems =
    item.dropdown?.filter((d) => isVisibleByRole(d.roles, currentRol)) || [];
  const isActive = visibleItems.some((d) => location.pathname.startsWith(d.to));

  if (visibleItems.length === 0) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`relative flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[13px] font-semibold transition-all duration-200 ${
          isActive
            ? "bg-white/15 text-white"
            : "text-white/65 hover:bg-white/10 hover:text-white"
        }`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <item.Icon size={14} strokeWidth={2.5} aria-hidden="true" />
        {item.label}
        <ChevronDown
          size={12}
          strokeWidth={2.5}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
        {isActive && !open && (
          <span className="absolute bottom-0.5 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-[#CC1A2E]" />
        )}
      </button>

      {open && (
        <div
          className={`absolute left-0 top-full z-50 mt-1.5 min-w-52 overflow-hidden rounded-xl border py-1 shadow-lg ${
            isDark
              ? "border-white/10 bg-[#0e1a35] shadow-black/40"
              : "border-[#cfd6e6] bg-white shadow-[#1B3D8F]/20"
          }`}
        >
          {visibleItems.map(({ to, label, Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2.5 px-4 py-2.5 text-[12px] font-semibold transition-colors duration-150 ${
                  active
                    ? isDark
                      ? "bg-[#CC1A2E]/20 text-[#CC1A2E] font-bold"
                      : "bg-[#CC1A2E]/10 text-[#CC1A2E] font-bold"
                    : isDark
                      ? "text-white/70 hover:bg-white/5 hover:text-white"
                      : "text-[#0e1f4d]/70 hover:bg-[#f0f3fa] hover:text-[#0e1f4d]"
                }`}
              >
                <Icon size={13} strokeWidth={2.5} aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── MainLayout ────────────────────────────────────────────────────────────────
export const MainLayout = () => {
  const { theme, toggleTheme } = useAppStore();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  const rol = user?.rol as Rol | undefined;
  const isDark = theme === "dark";

  // Filtrar items visibles por rol
  const visibleLinks = NAV_ITEMS.filter((item) =>
    isVisibleByRole(item.roles, rol),
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
          <span className="w-px bg-white" />
          <span className="flex-1 bg-white/20" />
        </div>

        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
          {/* Marca institucional */}
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

          {/* Nav desktop */}
          <nav
            aria-label="Navegación principal"
            className="hidden md:flex items-center gap-0.5"
          >
            {visibleLinks.map((item) => {
              if (
                item.dropdown &&
                hasVisibleDropdownItems(item.dropdown, rol)
              ) {
                return (
                  <DropdownMenu
                    key={item.label}
                    item={item}
                    isDark={isDark}
                    currentRol={rol}
                  />
                );
              }

              if (!item.dropdown) {
                const active = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to!}
                    className={`relative flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[13px] font-semibold transition-all duration-200 ${
                      active
                        ? "bg-white/15 text-white"
                        : "text-white/65 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <item.Icon size={14} strokeWidth={2.5} aria-hidden="true" />
                    {item.label}
                    {active && (
                      <span className="absolute bottom-0.5 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-[#CC1A2E]" />
                    )}
                  </Link>
                );
              }
              return null;
            })}
          </nav>

          {/* Controles derecha */}
          <div className="flex items-center gap-2">
            {/* Info usuario — desktop */}
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
                <Sun size={15} strokeWidth={2} />
              ) : (
                <Moon size={15} strokeWidth={2} />
              )}
            </button>

            {/* Botón Login / Salir */}
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
                  <LogOut size={13} strokeWidth={2.5} /> Salir
                </>
              ) : (
                <>
                  <LogIn size={13} strokeWidth={2.5} /> Iniciar sesión
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
              {mobileOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {/* ── Menú mobile ──────────────────────────────────────────────── */}
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
              {visibleLinks.map((item) => {
                // Dropdown en mobile
                if (
                  item.dropdown &&
                  hasVisibleDropdownItems(item.dropdown, rol)
                ) {
                  const isExpanded = mobileExpanded === item.label;
                  const visibleItems = item.dropdown.filter((d) =>
                    isVisibleByRole(d.roles, rol),
                  );
                  const isActive = visibleItems.some((d) =>
                    location.pathname.startsWith(d.to),
                  );

                  return (
                    <div key={item.label}>
                      <button
                        onClick={() =>
                          setMobileExpanded(isExpanded ? null : item.label)
                        }
                        className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-[13px] font-semibold transition-all ${
                          isActive
                            ? "bg-white/15 text-white"
                            : "text-white/65 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <item.Icon
                            size={14}
                            strokeWidth={2.5}
                            aria-hidden="true"
                          />
                          <span>{item.label}</span>
                        </div>
                        <ChevronDown
                          size={12}
                          strokeWidth={2.5}
                          className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                        />
                      </button>

                      {isExpanded && (
                        <div className="ml-4 mt-1 flex flex-col gap-0.5 border-l-2 border-white/20 pl-3">
                          {visibleItems.map(({ to, label, Icon }) => {
                            const childActive = location.pathname === to;
                            return (
                              <Link
                                key={to}
                                to={to}
                                onClick={() => {
                                  setMobileOpen(false);
                                  setMobileExpanded(null);
                                }}
                                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-semibold transition-colors ${
                                  childActive
                                    ? "text-[#CC1A2E] font-bold"
                                    : "text-white/60 hover:text-white"
                                }`}
                              >
                                <Icon
                                  size={13}
                                  strokeWidth={2.5}
                                  aria-hidden="true"
                                />
                                {label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                // Link simple en mobile
                if (!item.dropdown) {
                  const active = location.pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to!}
                      onClick={() => {
                        setMobileOpen(false);
                        setMobileExpanded(null);
                      }}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-[13px] font-semibold transition-all ${
                        active
                          ? "bg-white/15 text-white"
                          : "text-white/65 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <item.Icon
                        size={14}
                        strokeWidth={2.5}
                        aria-hidden="true"
                      />
                      {item.label}
                    </Link>
                  );
                }
                return null;
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
                    <LogOut size={14} strokeWidth={2.5} /> Cerrar sesión
                  </>
                ) : (
                  <>
                    <LogIn size={14} strokeWidth={2.5} /> Iniciar sesión
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
        {/* <Toaster
          richColors
          closeButton
          theme={isDark ? "dark" : "light"}
          expand={false}
          visibleToasts={3}
          position="top-right"
        /> */}
      </main>
    </div>
  );
};
