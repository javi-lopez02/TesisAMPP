import { useEffect, useMemo } from "react";
import { useAuthStore } from "../store/authStore";
import { FileText, Truck, ClipboardList } from "lucide-react";

// 🔹 Importar hooks
import { useSolicitudes } from "../hooks/useSolicitud";
import { useInventario } from "../hooks/useInventario";
import { useVehiculo } from "../hooks/useVehiculo";
import { useAsignacion } from "../hooks/useAsignacion";
import { useReporteConsumo } from "../hooks/useReporteConsumo";
import { useMantenimiento } from "../hooks/useMantenimiento";

// 🔹 Importar componentes
import { HeroSection } from "../components/homepage/HeroSection";
import { StatsSection } from "../components/homepage/StatsSection";
import { ModulesSection } from "../components/homepage/ModulesSection";
import { ActivitySection } from "../components/homepage/ActivitySection";
import { AccessDeniedSection } from "../components/homepage/AccessDeneidSection";
import { FooterSection } from "../components/homepage/FooterSection";

// 🔹 Importar helpers
import {
  calcularEstadisticas,
  generarActividadReciente,
} from "../components/homepage/HelpersHomePage";

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
  quickAction?: { label: string; to: string };
}

// ── Módulos ──────────────────────────────────────────────────────────────────
const MODULES: ModuleCard[] = [
  {
    to: "/solicitudes/mis-solicitudes",
    label: "Solicitudes",
    description:
      "Gestiona y realiza solicitudes de combustible para actividades institucionales.",
    Icon: FileText,
    accent: "#1B3D8F",
    roles: ["ADMINISTRADOR", "SUPERVISOR", "DELEGADO", "PRESIDENTE_CONSEJO"],
    quickAction: { label: "Nueva solicitud", to: "/solicitudes/crear" },
  },
  {
    to: "/asignaciones",
    label: "Asignaciones",
    description:
      "Consulta las asignaciones de combustible y vehículos para tus actividades.",
    Icon: ClipboardList,
    accent: "#059669",
    roles: ["ADMINISTRADOR", "SUPERVISOR", "CHOFER"],
  },
  {
    to: "/vehiculos/mantenimientos",
    label: "Vehículos",
    description:
      "Administra mantenimientos y reportes de consumo del parque vehicular.",
    Icon: Truck,
    accent: "#7c3aed",
    roles: ["ADMINISTRADOR", "SUPERVISOR", "CHOFER"],
    quickAction: {
      label: "Reportar consumo",
      to: "/vehiculos/reportes-consumo",
    },
  },
];

// ── Componente Principal ─────────────────────────────────────────────────────
export const HomePage = () => {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const rol = user?.rol as Rol | undefined;

  // 🔹 Hooks de datos
  const { solicitud: solicitudes, getAll: getAllSolicitudes } =
    useSolicitudes();
  const { inventario, getAll: getAllInventario } = useInventario();
  const { vehiculos, getAll: getAllVehiculos } = useVehiculo();
  const { getAll: getAllAsignaciones } = useAsignacion();
  const { getAll: getAllReportes } = useReporteConsumo();
  const { mantenimientos, getAll: getAllMantenimientos } = useMantenimiento();

  // 🔹 Cargar todos los datos al montar
  useEffect(() => {
    if (!isAuthenticated) return;

    const usuarioId = user?.id;
    getAllSolicitudes({ usuarioId });
    getAllInventario();
    getAllVehiculos();
    getAllAsignaciones();
    getAllReportes();
    getAllMantenimientos();
  }, [
    isAuthenticated,
    user?.id,
    getAllSolicitudes,
    getAllInventario,
    getAllVehiculos,
    getAllAsignaciones,
    getAllReportes,
    getAllMantenimientos,
  ]);

  // 🔹 Calcular estadísticas usando helper
  const stats = useMemo(
    () =>
      calcularEstadisticas(
        solicitudes,
        vehiculos,
        inventario,
        mantenimientos,
        rol,
      ),
    [solicitudes, vehiculos, inventario, mantenimientos, rol],
  );

  // 🔹 Generar actividad reciente usando helper
  const activities = useMemo(
    () => generarActividadReciente(solicitudes, mantenimientos),
    [solicitudes, mantenimientos],
  );

  // 🔹 Filtrar módulos por rol
  const visibleModules = useMemo(
    () =>
      MODULES.filter(
        ({ roles }) =>
          !roles || rol === "ADMINISTRADOR" || (rol && roles.includes(rol)),
      ),
    [rol],
  );

  return (
    <div className="space-y-8">
      {/* Hero */}
      <HeroSection isAuthenticated={isAuthenticated} user={user} />

      {/* Estadísticas (solo para administradores y supervisores) */}
      {isAuthenticated && (rol === "ADMINISTRADOR" || rol === "SUPERVISOR") && (
        <StatsSection stats={stats} />
      )}

      {/* Módulos accesibles */}
      {isAuthenticated && <ModulesSection modules={visibleModules} />}

      {/* Actividad reciente */}
      {isAuthenticated && (
        <ActivitySection activities={activities} userRol={rol} />
      )}

      {/* Acceso restringido */}
      {!isAuthenticated && <AccessDeniedSection />}

      {/* Footer */}
      <FooterSection />
    </div>
  );
};
