// src/validations/consejo.validations.ts
import { z } from "zod";
import type { getConsejo, FormState } from "../types/consejo.types";

// ── Constantes compartidas ──────────────────────────────────────────────────
export const CODIGO_CONSEJO_REGEX = /^CP-[A-Z]{2,6}-\d{3}$/;
export const CODIGO_FORMATO_MSG = "Formato: CP-XXX-000";

// ── Schema base compartido con backend ───────────────────────────────────────
// Define las reglas que deben cumplirse SIEMPRE (frontend + backend)
export const consejoBaseSchema = z.object({
  nombre: z
    .string()
    .min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  codigo: z.string().min(1, { message: "El código es obligatorio" }),
  presidenteId: z
    .string()
    .uuid({ message: "ID de Presidente inválido" })
    .optional(),
  activo: z.boolean().optional(),
});

// ── Schema específico para frontend (con validaciones adicionales) ───────────
// Extiende el base con reglas que solo aplican en la UI
export const consejoFormSchema = consejoBaseSchema.extend({
  codigo: consejoBaseSchema.shape.codigo.refine(
    (val) => !val || CODIGO_CONSEJO_REGEX.test(val),
    { message: CODIGO_FORMATO_MSG },
  ),
});

// ── Schema para edición (campos opcionales) ──────────────────────────────────
export const consejoEditSchema = consejoBaseSchema.partial().extend({
  codigo: consejoBaseSchema.shape.codigo
    .refine((val) => !val || CODIGO_CONSEJO_REGEX.test(val), {
      message: CODIGO_FORMATO_MSG,
    })
    .optional()
    .nullable(),
  presidenteId: consejoBaseSchema.shape.presidenteId.optional().nullable(),
});

// ── Tipos inferidos ──────────────────────────────────────────────────────────
export type ConsejoFormInput = z.infer<typeof consejoFormSchema>;
export type ConsejoEditInput = z.infer<typeof consejoEditSchema>;

// ── Helper para validar formulario ───────────────────────────────────────────
export interface ValidationResult {
  isValid: boolean;
  errors: Partial<Record<keyof FormState, string>>;
  data?: ConsejoFormInput;
}

/**
 * Valida un formulario de Consejo usando Zod
 * @param data - Los datos del formulario a validar
 * @param mode - 'crear' o 'editar' para usar el schema adecuado
 * @returns Resultado de validación con errores formateados
 */
export const validateConsejoForm = (
  data: unknown,
  mode: "crear" | "editar" = "crear",
): ValidationResult => {
  const schema = mode === "crear" ? consejoFormSchema : consejoEditSchema;
  const result = schema.safeParse(data);

  if (!result.success) {
    // Convertir errores de Zod a formato amigable para el formulario
    const errors: Partial<Record<keyof FormState, string>> = {};

    result.error.issues.forEach((err) => {
      const field = err.path[0] as keyof FormState;
      if (field && !errors[field]) {
        errors[field] = err.message;
      }
    });

    return { isValid: false, errors };
  }

  return { isValid: true, data: result.data as ConsejoFormInput, errors: {} };
};

// ── Validación de duplicados (lógica de negocio que requiere datos externos) ─
/**
 * Verifica si existe un Consejo duplicado por nombre
 * Esta validación NO puede hacerse con Zod porque requiere acceso a la lista existente
 * @param nombre - Nombre del consejo a validar
 * @param existingConsejos - Lista de consejos existentes desde el backend
 * @param editingId - ID del registro que se está editando (para excluirlo de la validación)
 * @returns Mensaje de error si hay duplicado, undefined si está OK
 */
export const validateConsejoDuplicate = (
  nombre: string,
  existingConsejos: getConsejo[] | null,
  editingId?: string | null,
): string | undefined => {
  if (!existingConsejos || !nombre.trim()) return undefined;

  const duplicado = existingConsejos.find(
    (c) =>
      c.nombre.toLowerCase() === nombre.trim().toLowerCase() &&
      c.id !== editingId,
  );

  return duplicado ? "Ya existe un consejo con ese nombre" : undefined;
};

// ── Utilidades para UI ───────────────────────────────────────────────────────
/**
 * Formatea errores de Zod para mostrar en inputs individuales
 * Útil para validación en tiempo real (onChange)
 */
export const getFieldError = (
  error: z.ZodError | null,
  field: keyof FormState,
): string | undefined => {
  if (!error) return undefined;

  const fieldError = error.issues.find((err) => err.path[0] === field);
  return fieldError?.message;
};

/**
 * Resetear valores del formulario a estado inicial
 */
export const resetConsejoForm = (): FormState => ({
  nombre: "",
  codigo: "",
  activo: true,
  presidenteId: "",
});

/**
 * Validar formato de código en tiempo real (para feedback mientras escribe)
 */
export const validateCodigoFormat = (codigo: string): string | undefined => {
  if (!codigo) return undefined; // Vacío se valida como obligatorio en otro lado
  return CODIGO_CONSEJO_REGEX.test(codigo) ? undefined : CODIGO_FORMATO_MSG;
};
