// src/components/vehiculos/HelpersVehiculos.ts
import type { getVehiculo, EstadoVehiculo } from "../../types/vehiculo.types";

// ── Filtros ──────────────────────────────────────────────────────────────────
export interface FiltrosVehiculos {
  search: string;
  filterEstado: "todos" | EstadoVehiculo;
  filterActivo: "todos" | "activo" | "inactivo";
  filterTipoCombustible?: string;
}

export const aplicarFiltrosVehiculos = (
  vehiculos: getVehiculo[] | null,
  filtros: FiltrosVehiculos,
): getVehiculo[] => {
  const { search, filterEstado, filterActivo, filterTipoCombustible } = filtros;
  const lista = vehiculos ?? [];
  const q = search.toLowerCase();

  return lista.filter((v) => {
    // Búsqueda por texto
    const matchSearch =
      v.placa.toLowerCase().includes(q) ||
      v.marca.toLowerCase().includes(q) ||
      v.tipoCombustible.nombre.toLowerCase().includes(q) ||
      v.chofer?.nombre.toLowerCase().includes(q) ||
      v.chofer?.apellidos.toLowerCase().includes(q);

    // Filtro por estado
    const matchEstado = filterEstado === "todos" ? true : v.estado === filterEstado;

    // Filtro por activo
    const matchActivo =
      filterActivo === "todos"
        ? true
        : filterActivo === "activo"
          ? v.activo
          : !v.activo;

    // Filtro por tipo de combustible
    const matchTipo = filterTipoCombustible
      ? v.tipoCombustibleId === filterTipoCombustible
      : true;

    return matchSearch && matchEstado && matchActivo && matchTipo;
  });
};

// ── Métricas ─────────────────────────────────────────────────────────────────
export interface MetricasVehiculos {
  total: number;
  activos: number;
  inactivos: number;
  disponibles: number;
  enUso: number;
  enMantenimiento: number;
  fueraDeServicio: number;
  kilometrajeTotal: number;
  kilometrajePromedio: number;
}

export const calcularMetricasVehiculos = (
  vehiculos: getVehiculo[] | null,
): MetricasVehiculos => {
  const lista = vehiculos ?? [];

  const activos = lista.filter((v) => v.activo).length;
  const inactivos = lista.length - activos;

  const disponibles = lista.filter((v) => v.estado === "DISPONIBLE").length;
  const enUso = lista.filter((v) => v.estado === "EN_USO").length;
  const enMantenimiento = lista.filter((v) => v.estado === "MANTENIMIENTO").length;
  const fueraDeServicio = lista.filter((v) => v.estado === "FUERA_DE_SERVICIO").length;

  const kilometrajeTotal = lista.reduce((acc, v) => {
    const km = typeof v.kilometraje === "string" ? Number(v.kilometraje) : v.kilometraje;
    return acc + (isNaN(km) ? 0 : km);
  }, 0);
  
  const kilometrajePromedio = lista.length > 0 
    ? Math.round(kilometrajeTotal / lista.length) 
    : 0;

  return {
    total: lista.length,
    activos,
    inactivos,
    disponibles,
    enUso,
    enMantenimiento,
    fueraDeServicio,
    kilometrajeTotal,
    kilometrajePromedio,
  };
};

// ── Helpers de formato ───────────────────────────────────────────────────────
export const getEstadoLabel = (estado: EstadoVehiculo): string => {
  const labels: Record<EstadoVehiculo, string> = {
    DISPONIBLE: "Disponible",
    EN_USO: "En Uso",
    MANTENIMIENTO: "Mantenimiento",
    FUERA_DE_SERVICIO: "Fuera de Servicio",
  };
  return labels[estado];
};

export const getEstadoColor = (estado: EstadoVehiculo): string => {
  const colors: Record<EstadoVehiculo, string> = {
    DISPONIBLE: "bg-[#3B6D11]/10 text-[#3B6D11] dark:bg-[#3B6D11]/20 dark:text-[#9FD97A]",
    EN_USO: "bg-[#1B3D8F]/10 text-[#1B3D8F] dark:bg-[#1B3D8F]/20 dark:text-[#85B7EB]",
    MANTENIMIENTO: "bg-[#B77C1B]/10 text-[#B77C1B] dark:bg-[#B77C1B]/20 dark:text-[#E8C57A]",
    FUERA_DE_SERVICIO: "bg-[#CC1A2E]/10 text-[#CC1A2E] dark:bg-[#CC1A2E]/20 dark:text-[#F09595]",
  };
  return colors[estado];
};

export const formatearKilometraje = (km: number): string => {
  return `${km.toLocaleString("es-CU")} km`;
};

export const formatearCapacidad = (capacidad: number): string => {
  return `${capacidad.toLocaleString("es-CU")} L`;
};

export const ESTADOS: { value: EstadoVehiculo; label: string; desc: string }[] = [
  { value: "DISPONIBLE", label: "Disponible", desc: "Listo para asignar" },
  { value: "EN_USO", label: "En Uso", desc: "Actualmente asignado" },
  { value: "MANTENIMIENTO", label: "Mantenimiento", desc: "En reparación programada" },
  { value: "FUERA_DE_SERVICIO", label: "Fuera de Servicio", desc: "No operativo" },
];