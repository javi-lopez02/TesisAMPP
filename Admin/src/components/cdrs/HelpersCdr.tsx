// src/components/cdrs/HelpersCdrs.ts
import type { getCdrs } from "../../types/cdrs.types";

// ── Constantes ───────────────────────────────────────────────────────────────
export const NUMERO_MINIMO = 1;

// ── Filtros ──────────────────────────────────────────────────────────────────
export interface FiltrosCdrs {
  search: string;
  filterActivo: "todos" | "activo" | "inactivo";
}

export const aplicarFiltrosCdrs = (
  cdrs: getCdrs[] | null,
  filtros: FiltrosCdrs,
): getCdrs[] => {
  const { search, filterActivo } = filtros;
  const lista = cdrs ?? [];
  const q = search.toLowerCase();

  return lista.filter((c) => {
    // Búsqueda por texto (número, dirección, zona)
    const matchSearch =
      c.numero.toString().includes(q) ||
      c.direccion.toLowerCase().includes(q) ||
      c.zona?.nombre.toLowerCase().includes(q) ||
      c.zona?.codigo?.toLowerCase().includes(q);

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
