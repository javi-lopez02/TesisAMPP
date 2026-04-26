// src/pages/HomePage.tsx
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import {
  FileText,
  Fuel,
  Truck,
  Map,
  Building2,
  BarChart3,
  ArrowRight,
  ShieldCheck,
  Clock,
  Users,
} from "lucide-react";

// ── Tipos ────────────────────────────────────────────────────────────────────
type Rol =
  | "ADMINISTRADOR"
  | "SUPERVISOR"
  | "DELEGADO"
  | "PRESIDENTE_CONSEJO"
  | "CHOFER";

interface ModuleCard {
  to: string;
  label: string;
  description: string;
  Icon: React.ElementType;
  accent: string;
  roles?: Rol[];
}

// ── Módulos ───────────────────────────────────────────────────────────────────
const MODULES: ModuleCard[] = [
  {
    to: "/solicitudes",
    label: "Solicitudes",
    description:
      "Gestiona y realiza solicitudes de combustible para actividades institucionales.",
    Icon: FileText,
    accent: "#1B3D8F",
    roles: ["ADMINISTRADOR", "SUPERVISOR", "DELEGADO", "PRESIDENTE_CONSEJO"],
  },
  {
    to: "/tanques",
    label: "Tanques",
    description:
      "Monitorea los niveles, entradas y salidas de combustible en los tanques.",
    Icon: Fuel,
    accent: "#0e7490",
    roles: ["ADMINISTRADOR", "SUPERVISOR"],
  },
  {
    to: "/vehiculos",
    label: "Vehículos",
    description:
      "Administra el parque vehicular, mantenimientos y estado de cada unidad.",
    Icon: Truck,
    accent: "#7c3aed",
    roles: ["ADMINISTRADOR", "SUPERVISOR", "CHOFER"],
  },
  {
    to: "/rutas",
    label: "Rutas",
    description:
      "Configura y consulta las rutas asignadas a cada delegacía y consejo.",
    Icon: Map,
    accent: "#059669",
    roles: ["ADMINISTRADOR", "SUPERVISOR"],
  },
  {
    to: "/consejos-populares",
    label: "Consejos Populares",
    description:
      "Administra los consejos populares y delegacías del municipio.",
    Icon: Building2,
    accent: "#CC1A2E",
    roles: ["ADMINISTRADOR"],
  },
  {
    to: "/reportes",
    label: "Reportes",
    description:
      "Consulta el consumo real, rendimiento y reportes de cada asignación.",
    Icon: BarChart3,
    accent: "#d97706",
    roles: ["ADMINISTRADOR", "SUPERVISOR", "CHOFER"],
  },
];

// ── Estadísticas ──────────────────────────────────────────────────────────────
const STATS = [
  { label: "Solicitudes activas", value: "—", Icon: FileText },
  { label: "Vehículos disponibles", value: "—", Icon: Truck },
  { label: "Litros en tanques", value: "—", Icon: Fuel },
  { label: "Usuarios registrados", value: "—", Icon: Users },
];

// ── Componente ────────────────────────────────────────────────────────────────
export const HomePage = () => {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const rol = user?.rol as Rol | undefined;

  const visibleModules = MODULES.filter(
    ({ roles }) =>
      !roles || rol === "ADMINISTRADOR" || (rol && roles.includes(rol)),
  );

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Buenos días";
    if (h < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  const rolLabel =
    rol
      ?.toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()) ?? "";

  return (
    <div className="space-y-10">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl bg-[#1B3D8F] px-8 py-10 shadow-[0_8px_32px_rgba(27,61,143,0.35)]">
        {/* Decoración */}
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden="true"
        >
          <div
            className="absolute -right-10 -top-10 h-64 w-64 opacity-5"
            style={{
              background: "white",
              clipPath:
                "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)",
            }}
          />
          <div
            className="absolute -bottom-16 -left-8 h-48 w-48 opacity-5"
            style={{
              background: "white",
              clipPath:
                "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)",
            }}
          />
          <div className="absolute right-0 top-0 h-full w-1 bg-[#CC1A2E]" />
        </div>

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {isAuthenticated && user ? (
              <>
                <p className="mb-1 text-[12px] font-semibold uppercase tracking-[0.2em] text-white/50">
                  {greeting()}, {rolLabel}
                </p>
                <h1 className="text-2xl font-bold text-white sm:text-3xl">
                  {user.nombre} {user.apellidos}
                </h1>
                <p className="mt-2 max-w-md text-[13px] leading-relaxed text-white/60">
                  Bienvenido al sistema de gestión de combustible de la Asamblea
                  Municipal del Poder Popular.
                </p>
              </>
            ) : (
              <>
                <p className="mb-1 text-[12px] font-semibold uppercase tracking-[0.2em] text-white/50">
                  República de Cuba
                </p>
                <h1 className="text-2xl font-bold text-white sm:text-3xl">
                  Asamblea Municipal
                  <br />
                  del Poder Popular
                </h1>
                <p className="mt-2 max-w-md text-[13px] leading-relaxed text-white/60">
                  Sistema de gestión y control de combustible institucional.
                  Inicia sesión para acceder.
                </p>
              </>
            )}
          </div>

          {!isAuthenticated ? (
            <Link
              to="/login"
              className="flex w-fit items-center gap-2 rounded-xl bg-[#CC1A2E] px-5 py-3 text-[13px] font-bold text-white shadow-[0_4px_14px_rgba(204,26,46,0.4)] transition-all hover:bg-[#a8151f]"
            >
              Iniciar sesión
              <ArrowRight size={14} strokeWidth={2.5} aria-hidden="true" />
            </Link>
          ) : (
            <div className="flex flex-col items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-center">
              <ShieldCheck
                size={22}
                className="text-[#CC1A2E]"
                aria-hidden="true"
              />
              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40">
                Sesión activa
              </p>
              <p className="text-[13px] font-bold text-white">{rolLabel}</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Estadísticas ─────────────────────────────────────────────────── */}
      {isAuthenticated && (rol === "ADMINISTRADOR" || rol === "SUPERVISOR") && (
        <section aria-label="Estadísticas generales">
          <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-[#7a8ab0]">
            Resumen general
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {STATS.map(({ label, value, Icon }) => (
              <div
                key={label}
                className="rounded-xl border border-[#dce3f0] bg-white px-4 py-4 shadow-sm
                           dark:border-white/10 dark:bg-[#0e1a35]"
              >
                <div className="mb-2 flex items-center gap-2">
                  <Icon
                    size={14}
                    className="text-[#1B3D8F] dark:text-white/40"
                    aria-hidden="true"
                  />
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7a8ab0]">
                    {label}
                  </p>
                </div>
                <p className="text-2xl font-bold text-[#0e1f4d] dark:text-white">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Accesos rápidos ───────────────────────────────────────────────── */}
      {isAuthenticated && visibleModules.length > 0 && (
        <section aria-label="Módulos del sistema">
          <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-[#7a8ab0]">
            Accesos rápidos
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visibleModules.map(({ to, label, description, Icon, accent }) => (
              <Link
                key={to}
                to={to}
                className="group relative overflow-hidden rounded-xl border border-[#dce3f0] bg-white p-5
                           shadow-sm transition-all duration-200
                           hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)]
                           dark:border-white/10 dark:bg-[#0e1a35]
                           dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
              >
                {/* Acento lateral */}
                <span
                  className="absolute left-0 top-0 h-full w-1 rounded-l-xl transition-all duration-200 group-hover:w-1.5"
                  style={{ background: accent }}
                  aria-hidden="true"
                />

                <div className="flex items-start justify-between">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-lg"
                    style={{ background: `${accent}18` }}
                    aria-hidden="true"
                  >
                    <Icon size={17} strokeWidth={2} style={{ color: accent }} />
                  </div>
                  <ArrowRight
                    size={14}
                    strokeWidth={2.5}
                    className="text-[#b0bcd0] transition-all duration-200
                               group-hover:translate-x-0.5 group-hover:text-[#1B3D8F]
                               dark:group-hover:text-white"
                    aria-hidden="true"
                  />
                </div>

                <p className="mt-3 text-[14px] font-bold text-[#0e1f4d] dark:text-white">
                  {label}
                </p>
                <p className="mt-1 text-[12px] leading-relaxed text-[#7a8ab0]">
                  {description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Sin sesión ────────────────────────────────────────────────────── */}
      {!isAuthenticated && (
        <section
          className="rounded-2xl border border-[#dce3f0] bg-white p-8 text-center shadow-sm
                     dark:border-white/10 dark:bg-[#0e1a35]"
        >
          <div
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full
                       bg-[#1B3D8F]/10 dark:bg-[#1B3D8F]/20"
            aria-hidden="true"
          >
            <ShieldCheck size={22} className="text-[#1B3D8F]" />
          </div>
          <h2 className="mb-2 text-[16px] font-bold text-[#0e1f4d] dark:text-white">
            Acceso restringido
          </h2>
          <p className="mb-5 text-[13px] text-[#7a8ab0]">
            Necesitas iniciar sesión con tus credenciales institucionales
            <br />
            para acceder a los módulos del sistema.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-lg bg-[#1B3D8F] px-5 py-2.5
                       text-[13px] font-semibold text-white transition-all hover:bg-[#1e48b0]"
          >
            Ir al inicio de sesión
            <ArrowRight size={13} strokeWidth={2.5} aria-hidden="true" />
          </Link>
        </section>
      )}

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="flex items-center justify-between border-t border-[#dce3f0] pt-6 dark:border-white/10">
        <div className="flex items-center gap-2">
          <div
            aria-hidden="true"
            className="h-5 w-5 bg-[#CC1A2E]"
            style={{
              clipPath:
                "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)",
            }}
          />
          <p className="text-[11px] text-[#7a8ab0]">
            Asamblea Municipal del Poder Popular — Sistema de Gestión de
            Combustible
          </p>
        </div>
        <div className="hidden items-center gap-1 sm:flex">
          <Clock size={11} className="text-[#b0bcd0]" aria-hidden="true" />
          <p className="text-[11px] text-[#b0bcd0]">
            {new Date().toLocaleDateString("es-CU", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </footer>
    </div>
  );
};
