// src/components/circunscripciones/HelpersCircunscripciones.ts
import type {
  FormState,
  getCircunscripcion,
} from "../../types/circunscripcion.types";

// ── Constantes ───────────────────────────────────────────────────────────────
export const CODIGO_CIRCUNSCRIPCION_REGEX = /^C-[A-Z]{2,6}-\d{3}$/;
export const CODIGO_FORMATO_MSG = "Formato: C-XXX-000";

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

// ── Validación de formulario ─────────────────────────────────────────────────
export interface ValidationResult {
  isValid: boolean;
  errors: Partial<Record<keyof FormState, string>>;
}

export const validarFormCircunscripcion = (
  form: FormState,
  existingCircunscripciones: getCircunscripcion[] | null,
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
  } else if (!CODIGO_CIRCUNSCRIPCION_REGEX.test(form.codigo)) {
    errs.codigo = CODIGO_FORMATO_MSG;
  }

  // Consejo Popular: obligatorio
  if (!form.consejoPopularId) {
    errs.consejoPopularId = "Debes seleccionar un consejo popular";
  }

  // Nombre único (excluyendo el registro que se está editando)
  const duplicado = existingCircunscripciones?.find(
    (c) =>
      c.nombre.toLowerCase() === form.nombre.trim().toLowerCase() &&
      c.id !== editingId,
  );
  if (duplicado) {
    errs.nombre = "Ya existe una circunscripción con ese nombre";
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
  return `C-${prefix}-${num}`;
};
