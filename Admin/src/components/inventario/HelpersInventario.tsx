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