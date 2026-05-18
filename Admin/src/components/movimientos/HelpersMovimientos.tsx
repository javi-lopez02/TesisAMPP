import type {
  getMovimientoCombustible,
  TipoMovimiento,
} from "../../types/movimiento.types";

export const formatDate = (date: string) =>
  new Date(date).toLocaleString("es-CU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// Clases de grid compartidas entre cabecera y filas
export const GRID_COLS = "grid-cols-[1fr_130px_120px_140px_160px_1fr]";
export const GRID_CLASS = `grid items-center gap-x-6 px-6`;

export const CREATION_TIPOS: {
  value: TipoMovimiento;
  label: string;
  desc: string;
}[] = [
  {
    value: "ASIGNACION_INICIAL",
    label: "Asignación Inicial",
    desc: "Crear o sumar al inventario",
  },
  {
    value: "ASIGNACION_SOLICITUD",
    label: "Solicitud",
    desc: "Solicitud de asignacion",
  },
  {
    value: "DEVOLUCION",
    label: "Devolución",
    desc: "Combustible devuelto al inventario",
  },
  { value: "AJUSTE", label: "Ajuste", desc: "Corrección manual de saldo" },
  { value: "MERMA", label: "Merma", desc: "Pérdida o desperdicio registrado" },
];

export const TIPO_LABELS: Record<TipoMovimiento, string> = {
  ASIGNACION_INICIAL: "Asignación Inicial",
  ASIGNACION_SOLICITUD: "Asig. por Solicitud",
  DEVOLUCION: "Devolución",
  AJUSTE: "Ajuste",
  MERMA: "Merma",
};

export const TIPO_COLORS: Record<TipoMovimiento, string> = {
  ASIGNACION_INICIAL:
    "bg-[#1B3D8F]/10 text-[#1B3D8F] dark:bg-[#1B3D8F]/20 dark:text-[#85B7EB]",
  ASIGNACION_SOLICITUD:
    "bg-[#3B6D11]/10 text-[#3B6D11] dark:bg-[#3B6D11]/20 dark:text-[#9FD97A]",
  DEVOLUCION:
    "bg-[#8B5CF6]/10 text-[#8B5CF6] dark:bg-[#8B5CF6]/20 dark:text-[#C4B5FD]",
  AJUSTE:
    "bg-[#B77C1B]/10 text-[#B77C1B] dark:bg-[#B77C1B]/20 dark:text-[#E8C57A]",
  MERMA: "bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-white/40",
};

export const TIPOS_SALIDA: TipoMovimiento[] = ["ASIGNACION_SOLICITUD", "MERMA"];

export const getTipoLabel = (t: TipoMovimiento) => TIPO_LABELS[t];
export const getTipoColor = (t: TipoMovimiento) => TIPO_COLORS[t];

export interface MetricasMovimientos {
  total: number;
  totalEntradas: number;
  totalSalidas: number;
  movimientosHoy: number;
  saldoNeto: number;
}

export const calcularMetricas = (
  movimientos: getMovimientoCombustible[] | null,
): MetricasMovimientos => {
  const lista = movimientos ?? [];

  const totalEntradas = lista
    .filter((m) => !TIPOS_SALIDA.includes(m.tipo))
    .reduce((acc, m) => acc + m.cantidad, 0);

  const totalSalidas = lista
    .filter((m) => TIPOS_SALIDA.includes(m.tipo))
    .reduce((acc, m) => acc + m.cantidad, 0);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const movimientosHoy = lista.filter(
    (m) => new Date(m.createdAt) >= hoy,
  ).length;

  return {
    total: lista.length,
    totalEntradas,
    totalSalidas,
    movimientosHoy,
    saldoNeto: totalEntradas - totalSalidas,
  };
};

// ── Filtros ──────────────────────────────────────────────────────────────────
export interface FiltrosMovimientos {
  search: string;
  filterTipo: "todos" | TipoMovimiento;
  dateRange: { desde?: string; hasta?: string };
}

export const aplicarFiltros = (
  movimientos: getMovimientoCombustible[] | null,
  filtros: FiltrosMovimientos,
): getMovimientoCombustible[] => {
  const { search, filterTipo, dateRange } = filtros;
  const lista = movimientos ?? [];
  const q = search.toLowerCase();

  return lista.filter((m) => {
    // Búsqueda por texto
    const matchSearch =
      m.tipoCombustible.nombre.toLowerCase().includes(q) ||
      m.observaciones?.toLowerCase().includes(q) ||
      m.usuario.nombre.toLowerCase().includes(q) ||
      m.usuario.apellidos.toLowerCase().includes(q);

    // Filtro por tipo
    const matchTipo = filterTipo === "todos" ? true : m.tipo === filterTipo;

    // Filtro por fecha
    const matchDate =
      (!dateRange.desde ||
        new Date(m.createdAt) >= new Date(dateRange.desde)) &&
      (!dateRange.hasta || new Date(m.createdAt) <= new Date(dateRange.hasta));

    return matchSearch && matchTipo && matchDate;
  });
};

export const formatearCantidad = (cantidad: number, decimales = 2): string => {
  return `${cantidad.toLocaleString("es-CU", { minimumFractionDigits: decimales, maximumFractionDigits: decimales })} L`;
};

// export const calcularImpactoSaldo = (
//   saldoActual: number,
//   cantidad: number,
//   tipo: TipoMovimiento,
// ): { nuevoSaldo: number; signo: "+" | "-"; color: string } => {
//   const esEntrada = !TIPOS_SALIDA.includes(tipo) || tipo === "DEVOLUCION" || tipo === "AJUSTE";
//   const delta = esEntrada ? cantidad : -cantidad;
//   const nuevoSaldo = saldoActual + delta;
  
//   return {
//     nuevoSaldo,
//     signo: delta >= 0 ? "+" : "-",
//     color: delta >= 0 ? "text-[#3B6D11]" : "text-[#CC1A2E]",
//   };
// };