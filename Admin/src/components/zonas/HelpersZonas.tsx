// src/components/zonas/HelpersZonas.ts
import type { FormState, getZonas } from "../../types/zonas.types";

// ── Constantes ───────────────────────────────────────────────────────────────
export const CODIGO_ZONA_REGEX = /^Z-[A-Z]{2,6}-\d{3}$/;
export const CODIGO_FORMATO_MSG = "Formato: Z-XXX-000";

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

// ── Validación de formulario ─────────────────────────────────────────────────
export interface ValidationResult {
  isValid: boolean;
  errors: Partial<Record<keyof FormState, string>>;
}

export const validarFormZona = (
  form: FormState,
  existingZonas: getZonas[] | null,
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
  } else if (!CODIGO_ZONA_REGEX.test(form.codigo)) {
    errs.codigo = CODIGO_FORMATO_MSG;
  }

  // Circunscripción: obligatoria
  if (!form.circunscripcionId) {
    errs.circunscripcionId = "Debes seleccionar una circunscripción";
  }

  // Nombre único (excluyendo el registro que se está editando)
  const duplicado = existingZonas?.find(
    (z) =>
      z.nombre.toLowerCase() === form.nombre.trim().toLowerCase() &&
      z.id !== editingId,
  );
  if (duplicado) {
    errs.nombre = "Ya existe una zona con ese nombre";
  }

  return {
    isValid: Object.keys(errs).length === 0,
    errors: errs,
  };
};