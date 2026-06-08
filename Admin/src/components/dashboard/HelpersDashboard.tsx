import type { getSolicitud } from "../../types/solicitud.types";
import type { getInventario } from "../../types/inventario.types";
import type { getAsignacion } from "../../types/asignacion.types";
import type { getReporte } from "../../types/reporte-consumo.types";

// ── Interfaces de resultados ─────────────────────────────────────────────────

export interface MetricasSolicitudes {
  solicitudesHoy: number;
  solicitudesHoyAprobadas: number;
  solicitudesHoyPendientes: number;
  solicitudesCriticas: number;
}

export interface MetricasAsignaciones {
  asignacionesActivas: number;
  asignacionesEnUso: number;
  asignacionesAsignadas: number;
}

export interface MetricasInventario {
  combustibleTotalLitros: number;
}

export interface MetricasRendimiento {
  rendimientoPromedio: number;
}

export interface DashboardStats {
  solicitudes: MetricasSolicitudes;
  asignaciones: MetricasAsignaciones;
  inventario: MetricasInventario;
  rendimiento: MetricasRendimiento;
}

// ── Funciones de cálculo ─────────────────────────────────────────────────────

/**
 * Calcula métricas de solicitudes: hoy, aprobadas, pendientes, críticas
 */
export const calcularMetricasSolicitudes = (
  solicitudes: getSolicitud[] | null,
): MetricasSolicitudes => {
  const lista = solicitudes ?? [];
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const solicitudesHoy = lista.filter((s) => new Date(s.fechaCreacion) >= hoy);
  const solicitudesHoyAprobadas = solicitudesHoy.filter(
    (s) => s.estado === "APROBADA",
  ).length;
  const solicitudesHoyPendientes = solicitudesHoy.filter(
    (s) => s.estado === "PENDIENTE",
  ).length;

  // Solicitudes críticas (>48h pendientes)
  const hace48h = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const solicitudesCriticas = lista.filter(
    (s) => s.estado === "PENDIENTE" && new Date(s.fechaCreacion) < hace48h,
  ).length;

  return {
    solicitudesHoy: solicitudesHoy.length,
    solicitudesHoyAprobadas,
    solicitudesHoyPendientes,
    solicitudesCriticas,
  };
};

/**
 * Calcula métricas de asignaciones: activas, en uso, asignadas
 */
export const calcularMetricasAsignaciones = (
  asignaciones: getAsignacion[] | null,
): MetricasAsignaciones => {
  const lista = asignaciones ?? [];

  const asignacionesActivas = lista.filter(
    (a) => a.estado !== "CANCELADA" && a.estado !== "COMPLETADA",
  ).length;
  const asignacionesEnUso = lista.filter(
    (a) => a.estado === "EN_PROGRESO",
  ).length;
  const asignacionesAsignadas = lista.filter(
    (a) => a.estado === "PENDIENTE",
  ).length;

  return {
    asignacionesActivas,
    asignacionesEnUso,
    asignacionesAsignadas,
  };
};

/**
 * Calcula combustible total disponible en inventario
 */
export const calcularCombustibleTotal = (
  inventario: getInventario[] | null,
): MetricasInventario => {
  const combustibleTotalLitros = (inventario ?? []).reduce(
    (acc, i) => acc + i.saldoActual,
    0,
  );

  return { combustibleTotalLitros };
};

/**
 * Calcula rendimiento promedio de vehículos
 */
export const calcularRendimientoPromedio = (
  reportes: getReporte[] | null,
): MetricasRendimiento => {
  const lista = reportes ?? [];
  const rendimientos = lista
    .filter((r) => r.rendimiento !== null && r.rendimiento !== undefined)
    .map((r) => r.rendimiento as number);

  const rendimientoPromedio =
    rendimientos.length > 0
      ? rendimientos.reduce((a, b) => a + b, 0) / rendimientos.length
      : 0;

  return { rendimientoPromedio };
};

/**
 * Calcula todas las métricas del dashboard de una vez
 */
export const calcularTodasLasMetricas = (
  solicitudes: getSolicitud[] | null,
  inventario: getInventario[] | null,
  asignaciones: getAsignacion[] | null,
  reportes: getReporte[] | null,
): DashboardStats => {
  return {
    solicitudes: calcularMetricasSolicitudes(solicitudes),
    asignaciones: calcularMetricasAsignaciones(asignaciones),
    inventario: calcularCombustibleTotal(inventario),
    rendimiento: calcularRendimientoPromedio(reportes),
  };
};

/**
 * Formatea la fecha actual para mostrar en el dashboard
 */
export const formatearFechaDashboard = (): string => {
  return new Date().toLocaleDateString("es-CU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};
