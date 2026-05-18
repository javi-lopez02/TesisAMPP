import type { getInventario } from "../../types/inventario.types";

// Helper para calcular porcentaje de uso
export const getUsagePercent = (
  cantidadAsignada: number,
  saldoActual: number,
) => {
  if (cantidadAsignada === 0) return 0;
  const used = cantidadAsignada - saldoActual;
  return Math.round((used / cantidadAsignada) * 100);
};

// Helper para color de barra de progreso
export const getUsageColor = (percent: number) => {
  if (percent >= 90) return "bg-[#CC1A2E]"; // Crítico
  if (percent >= 70) return "bg-[#B77C1B]"; // Advertencia
  return "bg-[#3B6D11]"; // Normal
};

// Helper para formato de fecha
export const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString("es-CU", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const UMBRAL_BAJO = 30; // % disponible por debajo del cual se considera "bajo"
export const UMBRAL_CRITICO = 15; // % disponible por debajo del cual se considera "crítico"

// ── Helper: porcentaje disponible ─────────────────────────────────────────────
export const pctDisponible = (inv: getInventario) =>
  inv.cantidadAsignada > 0
    ? Math.round((inv.saldoActual / inv.cantidadAsignada) * 100)
    : 0;

export const getNivelStockLabel = (inventario: getInventario): string => {
  const pct = pctDisponible(inventario);
  if (pct < UMBRAL_CRITICO) return "Crítico";
  if (pct < UMBRAL_BAJO) return "Bajo";
  return "Normal";
};

/**
 * Obtiene el color del badge según nivel de stock
 */
export const getNivelStockColor = (inventario: getInventario): string => {
  const pct = pctDisponible(inventario);
  if (pct < UMBRAL_CRITICO) {
    return "bg-[#CC1A2E]/10 text-[#CC1A2E] dark:bg-[#CC1A2E]/20 dark:text-[#F09595]";
  }
  if (pct < UMBRAL_BAJO) {
    return "bg-[#BA7517]/10 text-[#BA7517] dark:bg-[#BA7517]/20 dark:text-[#E8C57A]";
  }
  return "bg-[#3B6D11]/10 text-[#3B6D11] dark:bg-[#3B6D11]/20 dark:text-[#9FD97A]";
};

// ── Filtros ──────────────────────────────────────────────────────────────────
export interface FiltrosInventario {
  search: string;
  filterBajo: "todos" | "bajo" | "normal";
}

export const aplicarFiltrosInventario = (
  inventarios: getInventario[] | null,
  filtros: FiltrosInventario,
): getInventario[] => {
  const { search, filterBajo } = filtros;
  const lista = inventarios ?? [];
  const q = search.toLowerCase();

  return lista.filter((inv) => {
    // Búsqueda por texto (nombre o código del tipo de combustible)
    const matchSearch =
      inv.tipoCombustible.nombre.toLowerCase().includes(q) ||
      inv.tipoCombustible.codigo?.toLowerCase().includes(q);

    // Filtro por nivel de stock
    const pct = pctDisponible(inv);
    const matchBajo =
      filterBajo === "todos"
        ? true
        : filterBajo === "bajo"
          ? pct < UMBRAL_BAJO
          : pct >= UMBRAL_BAJO;

    return matchSearch && matchBajo;
  });
};

// ── Métricas calculadas ──────────────────────────────────────────────────────
export interface MetricasInventario {
  totalAsignado: number;
  totalDisponible: number;
  totalConsumido: number;
  conStockBajo: number;
  conStockCritico: number;
  totalMovimientos: number;
  pctGlobal: number;
}

export const calcularMetricasInventario = (
  inventarios: getInventario[] | null,
): MetricasInventario => {
  const lista = inventarios ?? [];

  const totalAsignado = lista.reduce((acc, i) => acc + i.cantidadAsignada, 0);
  const totalDisponible = lista.reduce((acc, i) => acc + i.saldoActual, 0);
  const totalConsumido = totalAsignado - totalDisponible;

  const conStockBajo = lista.filter(
    (i) => pctDisponible(i) < UMBRAL_BAJO,
  ).length;
  const conStockCritico = lista.filter(
    (i) => pctDisponible(i) < UMBRAL_CRITICO,
  ).length;

  const totalMovimientos = lista.reduce(
    (acc, i) => acc + (i._count?.movimientos ?? 0),
    0,
  );

  const pctGlobal =
    totalAsignado > 0 ? Math.round((totalDisponible / totalAsignado) * 100) : 0;

  return {
    totalAsignado,
    totalDisponible,
    totalConsumido,
    conStockBajo,
    conStockCritico,
    totalMovimientos,
    pctGlobal,
  };
};
