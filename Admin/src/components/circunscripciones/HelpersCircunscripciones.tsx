// src/components/circunscripciones/HelpersCircunscripciones.ts
import type { getCircunscripcion } from "../../types/circunscripcion.types";

// ── Filtros ──────────────────────────────────────────────────────────────────
export interface FiltrosCircunscripciones {
  search: string;
  filterActivo: "todos" | "activo" | "inactivo";
}

export const aplicarFiltrosCircunscripciones = (
  circunscripciones: getCircunscripcion[] | null,
  filtros: FiltrosCircunscripciones,
): getCircunscripcion[] => {
  const { search, filterActivo } = filtros;
  const lista = circunscripciones ?? [];
  const q = search.toLowerCase();

  return lista.filter((c) => {
    // Búsqueda por texto (nombre, código, delegado, consejo)
    const matchSearch =
      c.nombre.toLowerCase().includes(q) ||
      c.codigo?.toLowerCase().includes(q) ||
      c.delegado?.nombre.toLowerCase().includes(q) ||
      c.delegado?.apellidos.toLowerCase().includes(q) ||
      c.consejoPopular?.nombre.toLowerCase().includes(q);

    // Filtro por estado
    const matchActivo =
      filterActivo === "todos"
        ? true
        : filterActivo === "activo"
          ? c.activo
          : !c.activo;

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
  return `C-${prefix}-${num}`;
};
