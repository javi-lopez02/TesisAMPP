import type { getReporte } from "../../types/reporte-consumo.types";

export interface FiltrosReportes {
  search: string;
  dateRange?: { desde?: string; hasta?: string };
  asignacionId?: string;
}

export const aplicarFiltrosReportes = (
  reportes: getReporte[] | null,
  filtros: FiltrosReportes,
) => {
  const { search, dateRange,  } = filtros;
  const lista = reportes ?? [];
  const q = search.toLowerCase();

  return lista.filter((r) => {
    const matchSearch =
      r.observaciones?.toLowerCase().includes(q) ||
      r.asignacion.vehiculo?.placa?.toLowerCase().includes(q) ||
      r.asignacion.vehiculo?.marca?.toLowerCase().includes(q) 

    const matchDate =
      dateRange?.desde || dateRange?.hasta
        ? (!dateRange.desde ||
            new Date(r.createdAt) >= new Date(dateRange.desde)) &&
          (!dateRange.hasta ||
            new Date(r.createdAt) <= new Date(dateRange.hasta))
        : true;

    return matchSearch && matchDate;
  });
};

export interface MetricasReportes {
  total: number;
  consumoTotal: number;
  kilometrajeTotal: number;
  rendimientoPromedio: number | null;
}

export const calcularMetricasReportes = (
  reportes: getReporte[] | null,
): MetricasReportes => {
  const lista = reportes ?? [];
  const rendimientosValidos = lista
    .filter((r) => r.rendimiento !== null && r.rendimiento !== undefined)
    .map((r) => r.rendimiento as number);

  return {
    total: lista.length,
    consumoTotal: lista.reduce((acc, r) => acc + r.consumoReal, 0),
    kilometrajeTotal: lista.reduce((acc, r) => acc + r.kilometrajeRecorrido, 0),
    rendimientoPromedio:
      rendimientosValidos.length > 0
        ? rendimientosValidos.reduce((a, b) => a + b, 0) /
          rendimientosValidos.length
        : null,
  };
};


// Helpers de formato
export const formatearConsumo = (valor: number | string) => {
  const num = typeof valor === "string" ? Number(valor) : valor;
  return isNaN(num)
    ? "0 L"
    : `${num.toLocaleString("es-CU", { minimumFractionDigits: 2 })} L`;
};
export const formatearKilometraje = (km: number | string) => {
  const num = typeof km === "string" ? Number(km) : km;
  return isNaN(num) ? "0 km" : `${num.toLocaleString("es-CU")} km`;
};
export const formatearRendimiento = (rend: number | string | null) => {
  if (rend === null || rend === undefined) return "—";
  const num = typeof rend === "string" ? Number(rend) : rend;
  return isNaN(num) ? "— km/L" : `${num.toFixed(2)} km/L`;
};