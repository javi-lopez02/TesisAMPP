// src/components/consejos-populares/HelpersConsejos.ts
import type { getConsejo } from "../../types/consejo.types";

// ── Filtros ──────────────────────────────────────────────────────────────────
export interface FiltrosConsejos {
  search: string;
  filterActivo: "todos" | "activo" | "inactivo";
}

export const aplicarFiltrosConsejos = (
  consejos: getConsejo[] | null,
  filtros: FiltrosConsejos,
): getConsejo[] => {
  const { search, filterActivo } = filtros;
  const lista = consejos ?? [];
  const q = search.toLowerCase();

  return lista.filter((c) => {
    // Búsqueda por texto (nombre, código, presidente)
    const matchSearch =
      c.nombre.toLowerCase().includes(q) ||
      c.codigo?.toLowerCase().includes(q) ||
      c.presidente?.nombre.toLowerCase().includes(q) ||
      c.presidente?.apellidos.toLowerCase().includes(q);

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
  return `CP-${prefix}-${num}`;
};
