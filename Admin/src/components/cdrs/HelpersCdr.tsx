// src/components/cdrs/HelpersCdrs.ts
import type { FormState, getCdrs } from "../../types/cdrs.types";

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

// ── Validación de formulario ─────────────────────────────────────────────────
export interface ValidationResult {
  isValid: boolean;
  errors: Partial<Record<keyof FormState, string>>;
}

export const validarFormCdr = (
  form: FormState,
  existingCdrs: getCdrs[] | null,
  editingId?: string | null,
): ValidationResult => {
  const errs: Partial<Record<keyof FormState, string>> = {};

  // Número: obligatorio, numérico y mayor a 0
  const numeroNum = Number(form.numero);
  if (!form.numero || isNaN(numeroNum) || numeroNum < NUMERO_MINIMO) {
    errs.numero = "El número debe ser válido y mayor a 0";
  }

  // Dirección: obligatoria
  if (!form.direccion.trim()) {
    errs.direccion = "La dirección es obligatoria";
  }

  // Zona: obligatoria
  if (!form.zonaId) {
    errs.zonaId = "Debes seleccionar una zona";
  }

  // Verificar duplicados por número + zona (excluyendo el registro que se edita)
  const duplicado = existingCdrs?.find(
    (c) =>
      c.numero.toString() === form.numero &&
      c.zona?.id === form.zonaId &&
      c.id !== editingId,
  );
  if (duplicado) {
    errs.numero = "Ya existe un CDR con este número en la zona seleccionada";
  }

  return {
    isValid: Object.keys(errs).length === 0,
    errors: errs,
  };
};
