// src/components/zonas/HelpersZonas.ts
import type { getZonas } from "../../types/zonas.types";

// ── Filtros ──────────────────────────────────────────────────────────────────
export interface FiltrosZonas {
  search: string;
  filterActivo: "todos" | "activo" | "inactivo";
}

export const aplicarFiltrosZonas = (
  zonas: getZonas[] | null,
  filtros: FiltrosZonas,
): getZonas[] => {
  const { search, filterActivo } = filtros;
  const lista = zonas ?? [];
  const q = search.toLowerCase();

  return lista.filter((z) => {
    // Búsqueda por texto (nombre, código, circunscripción)
    const matchSearch =
      z.nombre.toLowerCase().includes(q) ||
      z.codigo?.toLowerCase().includes(q) ||
      z.circunscripcion?.nombre.toLowerCase().includes(q);

    // Filtro por estado
    const matchActivo =
      filterActivo === "todos"
        ? true
        : filterActivo === "activo"
          ? z.activo
          : !z.activo;

    return matchSearch && matchActivo;
  });
};

export const generateCodigo = (nombre: string): string => {
  const words = nombre.trim().toUpperCase().split(/\s+/);
  const prefix = words
    .map((w) => w.slice(0, 3))
    .join("")
    .slice(0, 6);
  const num = String(Math.floor(Math.random() * 900) + 100);
  return `Z-${prefix}-${num}`;
};