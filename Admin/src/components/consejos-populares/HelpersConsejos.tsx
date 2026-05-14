// src/components/consejos-populares/HelpersConsejos.ts
import type { FormState, getConsejo } from "../../types/consejo.types";

// ── Constantes ───────────────────────────────────────────────────────────────
export const CODIGO_CONSEJO_REGEX = /^CP-[A-Z]{2,6}-\d{3}$/;
export const CODIGO_FORMATO_MSG = "Formato: CP-XXX-000";

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

// ── Validación de formulario ─────────────────────────────────────────────────
export interface ValidationResult {
  isValid: boolean;
  errors: Partial<Record<keyof FormState, string>>;
}

export const validarFormConsejo = (
  form: FormState,
  existingConsejos: getConsejo[] | null,
  editingId?: string | null,
): ValidationResult => {
  const errs: Partial<Record<keyof FormState, string>> = {};

  // Nombre: obligatorio
  if (!form.nombre.trim()) {
    errs.nombre = "El nombre es obligatorio";
  }

  // Código: obligatorio y formato válido
  if (!form.codigo.trim()) {
    errs.codigo = "El código es obligatorio";
  } else if (!CODIGO_CONSEJO_REGEX.test(form.codigo)) {
    errs.codigo = CODIGO_FORMATO_MSG;
  }

  // Nombre único (excluyendo el registro que se está editando)
  const duplicado = existingConsejos?.find(
    (c) =>
      c.nombre.toLowerCase() === form.nombre.trim().toLowerCase() &&
      c.id !== editingId,
  );
  if (duplicado) {
    errs.nombre = "Ya existe un consejo con ese nombre";
  }

  return {
    isValid: Object.keys(errs).length === 0,
    errors: errs,
  };
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