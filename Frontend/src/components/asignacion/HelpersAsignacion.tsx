import type {
  getAsignacion,
  EstadoAsignacion,
} from "../../types/asignacion.types";

export const ESTADOS_ASIGNACION: EstadoAsignacion[] = [
  "PENDIENTE",
  "EN_PROGRESO",
  "COMPLETADA",
  "CANCELADA",
];

export interface FiltrosAsignaciones {
  search: string;
  filterEstado: "todos" | EstadoAsignacion;
  filterVehiculo?: string;
  filterResponsable?: string;
  dateRange?: { desde?: string; hasta?: string };
}

export const aplicarFiltrosAsignaciones = (
  asignaciones: getAsignacion[] | null,
  filtros: FiltrosAsignaciones,
) => {
  const { search, filterEstado, filterVehiculo, filterResponsable, dateRange } =
    filtros;
  const lista = asignaciones ?? [];
  const q = search.toLowerCase();

  return lista.filter((a) => {
    const matchSearch =
      a.vehiculo.placa.toLowerCase().includes(q) ||
      a.vehiculo.marca.toLowerCase().includes(q) ||
      a.responsable.nombre.toLowerCase().includes(q) ||
      a.responsable.apellidos.toLowerCase().includes(q);
    //   a.solicitud?.descripcion?.toLowerCase().includes(q);

    const matchEstado = filterEstado === "todos" || a.estado === filterEstado;
    const matchVehiculo = filterVehiculo
      ? a.vehiculo.id === filterVehiculo
      : true;
    const matchResponsable = filterResponsable
      ? a.responsable.id === filterResponsable
      : true;

    const matchDate =
      dateRange?.desde || dateRange?.hasta
        ? (!dateRange.desde ||
            new Date(a.fechaAsignacion) >= new Date(dateRange.desde)) &&
          (!dateRange.hasta ||
            new Date(a.fechaAsignacion) <= new Date(dateRange.hasta))
        : true;

    return (
      matchSearch &&
      matchEstado &&
      matchVehiculo &&
      matchResponsable &&
      matchDate
    );
  });
};

export interface MetricasAsignaciones {
  total: number;
  pendientes: number;
  enProgreso: number;
  completadas: number;
  canceladas: number;
}

export const calcularMetricasAsignaciones = (
  asignaciones: getAsignacion[] | null,
): MetricasAsignaciones => {
  const lista = asignaciones ?? [];
  return {
    total: lista.length,
    pendientes: lista.filter((a) => a.estado === "PENDIENTE").length,
    enProgreso: lista.filter((a) => a.estado === "EN_PROGRESO").length,
    completadas: lista.filter((a) => a.estado === "COMPLETADA").length,
    canceladas: lista.filter((a) => a.estado === "CANCELADA").length,
  };
};

export const getEstadoLabel = (estado: EstadoAsignacion): string => {
  const labels: Record<EstadoAsignacion, string> = {
    PENDIENTE: "Pendiente",
    EN_PROGRESO: "En Progreso",
    COMPLETADA: "Completada",
    CANCELADA: "Cancelada",
  };
  return labels[estado];
};

export const getEstadoColor = (estado: EstadoAsignacion): string => {
  const colors: Record<EstadoAsignacion, string> = {
    PENDIENTE:
      "bg-[#BA7517]/10 text-[#BA7517] dark:bg-[#BA7517]/20 dark:text-[#E8C57A]",
    EN_PROGRESO:
      "bg-[#1B3D8F]/10 text-[#1B3D8F] dark:bg-[#1B3D8F]/20 dark:text-[#85B7EB]",
    COMPLETADA:
      "bg-[#3B6D11]/10 text-[#3B6D11] dark:bg-[#3B6D11]/20 dark:text-[#9FD97A]",
    CANCELADA:
      "bg-[#CC1A2E]/10 text-[#CC1A2E] dark:bg-[#CC1A2E]/20 dark:text-[#F09595]",
  };
  return colors[estado];
};

export const formatearFechaCorta = (fecha: string | Date) => {
  const d = typeof fecha === "string" ? new Date(fecha) : fecha;
  return d.toLocaleDateString("es-CU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
