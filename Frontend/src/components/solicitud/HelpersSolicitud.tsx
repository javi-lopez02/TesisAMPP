import type {
  getSolicitud,
  EstadoSolicitud,
  TipoSolicitud,
} from "../../types/solicitud.types";

export const ESTADOS_SOLICITUD: EstadoSolicitud[] = [
  "PENDIENTE",
  "APROBADA",
  "RECHAZADA",
  "CANCELADA",
  "COMPLETADA",
];

export const getEstadoLabel = (estado: EstadoSolicitud): string => {
  const labels: Record<EstadoSolicitud, string> = {
    PENDIENTE: "Pendiente",
    APROBADA: "Aprobada",
    RECHAZADA: "Rechazada",
    CANCELADA: "Cancelada",
    COMPLETADA: "Completada",
  };
  return labels[estado];
};

export const getEstadoColor = (estado: EstadoSolicitud): string => {
  const colors: Record<EstadoSolicitud, string> = {
    PENDIENTE:
      "bg-[#BA7517]/10 text-[#BA7517] dark:bg-[#BA7517]/20 dark:text-[#E8C57A]",
    APROBADA:
      "bg-[#3B6D11]/10 text-[#3B6D11] dark:bg-[#3B6D11]/20 dark:text-[#9FD97A]",
    RECHAZADA:
      "bg-[#CC1A2E]/10 text-[#CC1A2E] dark:bg-[#CC1A2E]/20 dark:text-[#F09595]",
    CANCELADA: "bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-white/40",
    COMPLETADA:
      "bg-[#1B3D8F]/10 text-[#1B3D8F] dark:bg-[#1B3D8F]/20 dark:text-[#85B7EB]",
  };
  return colors[estado];
};

export const getTipoSolicitudLabel = (tipo: TipoSolicitud): string => {
  const labels: Record<TipoSolicitud, string> = {
    FISCALIZACION: "Fiscalización",
    DISTRIBUCION: "Distribución",
    EMERGENCIA: "Emergencia",
    OTRO: "Otro",
  };
  return labels[tipo];
};

export interface FiltrosSolicitudes {
  search: string;
  filterEstado: "todos" | EstadoSolicitud;
  filterTipo: "todos" | TipoSolicitud;
  dateRange?: { desde?: string; hasta?: string };
}

export const aplicarFiltrosSolicitudes = (
  solicitudes: getSolicitud[] | null,
  filtros: FiltrosSolicitudes,
) => {
  const { search, filterEstado, filterTipo, dateRange } = filtros;
  const lista = solicitudes ?? [];
  const q = search.toLowerCase();

  return lista.filter((s) => {
    const matchSearch =
      s.descripcion.toLowerCase().includes(q) ||
      s.actividad.toLowerCase().includes(q) ||
      s.usuario.nombre.toLowerCase().includes(q) ||
      s.usuario.apellidos.toLowerCase().includes(q) ||
      s.tipoCombustible.nombre.toLowerCase().includes(q);

    const matchEstado = filterEstado === "todos" || s.estado === filterEstado;
    const matchTipo = filterTipo === "todos" || s.tipoSolicitud === filterTipo;

    const matchDate =
      dateRange?.desde || dateRange?.hasta
        ? (!dateRange.desde ||
            new Date(s.fechaSolicitada) >= new Date(dateRange.desde)) &&
          (!dateRange.hasta ||
            new Date(s.fechaSolicitada) <= new Date(dateRange.hasta))
        : true;

    return matchSearch && matchEstado && matchTipo && matchDate;
  });
};

export interface MetricasSolicitudes {
  total: number;
  pendientes: number;
  aprobadas: number;
  rechazadas: number;
  litrosPendientes: number;
}

export const calcularMetricasSolicitudes = (
  solicitudes: getSolicitud[] | null,
): MetricasSolicitudes => {
  const lista = solicitudes ?? [];
  return {
    total: lista.length,
    pendientes: lista.filter((s) => s.estado === "PENDIENTE").length,
    aprobadas: lista.filter((s) => s.estado === "APROBADA").length,
    rechazadas: lista.filter((s) => s.estado === "RECHAZADA").length,
    litrosPendientes: lista
      .filter((s) => s.estado === "PENDIENTE")
      .reduce((acc, s) => acc + s.cantidadLitros, 0),
  };
};

export const formatLitros = (litros: number) =>
  `${litros.toLocaleString("es-CU")} L`;
export const formatDistance = (km: number) => `${Number(km).toFixed(2)} km`;
export const formatTime = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};
export const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("es-CU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
