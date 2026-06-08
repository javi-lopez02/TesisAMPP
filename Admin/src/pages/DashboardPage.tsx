import { useEffect, useMemo } from "react";
import { useSolicitudes } from "../hooks/useSolicitud";
import { useInventario } from "../hooks/useInventario";
import { useVehiculo } from "../hooks/useVehiculo";
import { useAsignacion } from "../hooks/useAsignacion";
import { useReporteConsumo } from "../hooks/useReporteConsumo";

import { StatsCard } from "../components/dashboard/StatsCard";
import { AlertBanner } from "../components/dashboard/AlertBanner";
import { SolicitudesRecientes } from "../components/dashboard/SolicitudesRecientes";
import { InventarioCombustible } from "../components/dashboard/InventarioCombustible";
import { FlotaVehiculos } from "../components/dashboard/FlotaVehiculos";
import { ActividadReciente } from "../components/dashboard/ActividadReciente";
import { SolicitudesPorSolicitante } from "../components/dashboard/SolicitudesPorSolicitante";

// 🔹 Importar helpers de métricas
import {
  calcularTodasLasMetricas,
  formatearFechaDashboard,
} from "../components/dashboard/HelpersDashboard";

export const DashboardPage = () => {
  // 🔹 Cargar todos los datos al montar
  const { solicitud, getAll: getAllSolicitudes } = useSolicitudes();
  const { inventario, getAll: getAllInventario } = useInventario();
  const { vehiculos, getAll: getAllVehiculos } = useVehiculo();
  const { asignaciones, getAll: getAllAsignaciones } = useAsignacion();
  const { reportes, getAll: getAllReportes } = useReporteConsumo();

  useEffect(() => {
    getAllSolicitudes();
    getAllInventario();
    getAllVehiculos();
    getAllAsignaciones();
    getAllReportes();
  }, [
    getAllSolicitudes,
    getAllInventario,
    getAllVehiculos,
    getAllAsignaciones,
    getAllReportes,
  ]);

  // 🔹 Calcular métricas usando helpers (fuera del render directo)
  const stats = useMemo(
    () =>
      calcularTodasLasMetricas(solicitud, inventario, asignaciones, reportes),
    [solicitud, inventario, asignaciones, reportes],
  );

  // 🔹 Formatear fecha usando helper
  const fecha = useMemo(() => formatearFechaDashboard(), []);

  return (
    <div className="space-y-4 font-['Sora',sans-serif] hide-scrollbar">
      {/* Encabezado */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[19px] font-bold text-[#0e1f4d] dark:text-white">
            Buenos días, <span className="text-[#1B3D8F]">Administrador</span>
          </h1>
          <p className="mt-0.5 text-[12px] text-gray-400 dark:text-white/40">
            Asamblea Municipal del Poder Popular — Panel operativo
          </p>
        </div>
        <span className="rounded-full border border-black/[0.07] bg-white px-3.5 py-1.5 text-[11px] font-medium capitalize text-gray-400 dark:border-white/10 dark:bg-white/5 dark:text-white/40">
          {fecha}
        </span>
      </div>

      {/* Banner de alerta */}
      <AlertBanner count={stats.solicitudes.solicitudesCriticas} />

      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatsCard
          color="bg-[#1B3D8F]"
          label="Solicitudes hoy"
          value={stats.solicitudes.solicitudesHoy}
          sub={
            <>
              <span className="font-bold text-[#3B6D11]">
                {stats.solicitudes.solicitudesHoyAprobadas} aprobadas
              </span>
              {" · "}
              {stats.solicitudes.solicitudesHoyPendientes} pendientes
            </>
          }
        />
        <StatsCard
          color="bg-[#CC1A2E]"
          label="Combustible disponible"
          value={
            <>
              {stats.inventario.combustibleTotalLitros.toLocaleString("es-CU")}
              <span className="text-[13px] font-medium text-gray-400"> L</span>
            </>
          }
          sub="Total en inventario"
        />
        <StatsCard
          color="bg-[#BA7517]"
          label="Asignaciones activas"
          value={stats.asignaciones.asignacionesActivas}
          sub={
            <>
              {stats.asignaciones.asignacionesEnUso} en uso ·{" "}
              {stats.asignaciones.asignacionesAsignadas} asignadas
            </>
          }
        />
        <StatsCard
          color="bg-[#3B6D11]"
          label="Rendimiento promedio"
          value={
            <>
              {stats.rendimiento.rendimientoPromedio.toFixed(1)}
              <span className="text-[13px] font-medium text-gray-400">
                {" "}
                km/L
              </span>
            </>
          }
          sub="Últimos reportes"
        />
      </div>

      {/* Solicitudes recientes + Por solicitante */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SolicitudesRecientes solicitudes={solicitud} />
        <SolicitudesPorSolicitante solicitudes={solicitud} />
      </div>

      {/* Inventario + Flota + Actividad */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <InventarioCombustible inventario={inventario} />
        <FlotaVehiculos vehiculos={vehiculos} />
        <ActividadReciente solicitudes={solicitud} />
      </div>
    </div>
  );
};
