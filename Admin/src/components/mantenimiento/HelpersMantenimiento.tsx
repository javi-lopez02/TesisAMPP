import type {
  getMantenimiento,
  TipoMantenimiento,
} from "../../types/mantenimiento.types";

export interface FiltrosMantenimientos {
  search: string;
  filterTipo: "todos" | TipoMantenimiento;
  dateRange?: { desde?: string; hasta?: string };
}

export const aplicarFiltrosMantenimientos = (
  mantenimientos: getMantenimiento[] | null,
  filtros: FiltrosMantenimientos,
) => {
  const { search, filterTipo, dateRange } = filtros;
  const lista = mantenimientos ?? [];
  const q = search.toLowerCase();

  return lista.filter((m) => {
    const matchSearch =
      m.descripcion.toLowerCase().includes(q) ||
      m.vehiculo.placa.toLowerCase().includes(q) ||
      m.vehiculo.marca.toLowerCase().includes(q);
    const matchTipo = filterTipo === "todos" || m.tipo === filterTipo;
    const matchDate =
      dateRange?.desde || dateRange?.hasta
        ? (!dateRange.desde ||
            new Date(m.fecha) >= new Date(dateRange.desde)) &&
          (!dateRange.hasta || new Date(m.fecha) <= new Date(dateRange.hasta))
        : true;
    return matchSearch && matchTipo && matchDate;
  });
};

export interface MetricasMantenimientos {
  total: number;
  preventivos: number;
  correctivos: number;
  costoTotal: number;
  costoPromedio: number;
}

export const calcularMetricasMantenimientos = (
  mantenimientos: getMantenimiento[] | null,
): MetricasMantenimientos => {
  const lista = mantenimientos ?? [];
  return {
    total: lista.length,
    preventivos: lista.filter((m) => m.tipo === "Preventivo").length,
    correctivos: lista.filter((m) => m.tipo === "Correctivo").length,
    costoTotal: lista.reduce((acc, m) => acc + m.costo, 0),
    costoPromedio:
      lista.length > 0
        ? lista.reduce((acc, m) => acc + m.costo, 0) / lista.length
        : 0,
  };
};

// Helpers de formato
export const getTipoLabel = (tipo: TipoMantenimiento) => tipo;
export const getTipoColor = (tipo: TipoMantenimiento) =>
  tipo === "Preventivo"
    ? "bg-[#3B6D11]/10 text-[#3B6D11] dark:bg-[#3B6D11]/20 dark:text-[#9FD97A]"
    : "bg-[#CC1A2E]/10 text-[#CC1A2E] dark:bg-[#CC1A2E]/20 dark:text-[#F09595]";

export const formatearFechaCorta = (fecha: string | Date) => {
  const d = typeof fecha === "string" ? new Date(fecha) : fecha;
  return d.toLocaleDateString("es-CU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
};
export const formatearCosto = (costo: number | string) => {
  const num = typeof costo === "string" ? Number(costo) : costo;
  return isNaN(num)
    ? "$0.00"
    : `$${num.toLocaleString("es-CU", { minimumFractionDigits: 2 })}`;
};
export const formatearKilometraje = (km: number | string) => {
  const num = typeof km === "string" ? Number(km) : km;
  return isNaN(num) ? "0 km" : `${num.toLocaleString("es-CU")} km`;
};
