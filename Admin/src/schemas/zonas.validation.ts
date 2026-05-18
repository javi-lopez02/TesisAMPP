// src/validations/zona.validations.ts
import { z } from "zod";
import type { getZonas, FormState } from "../types/zonas.types";

// ── Constantes compartidas ──────────────────────────────────────────────────
export const CODIGO_ZONA_REGEX = /^Z-[A-Z]{2,6}-\d{3}$/;
export const CODIGO_FORMATO_MSG = "Formato: Z-XXX-000";

// ── Schema base compartido con backend ───────────────────────────────────────
// Define las reglas que deben cumplirse SIEMPRE (frontend + backend)
export const zonaBaseSchema = z.object({
  nombre: z.string().min(2, { message: "El nombre es obligatorio" }),
  codigo: z.string().optional(),
  circunscripcionId: z
    .string()
    .uuid({ message: "ID de Circunscripción inválido" }),
  activo: z.boolean().optional(),
});

// ── Schema específico para frontend (con validaciones adicionales) ───────────
// Extiende el base con reglas que solo aplican en la UI
export const zonaFormSchema = zonaBaseSchema.extend({
  codigo: z
    .string()
    .optional()
    .refine((val) => !val || CODIGO_ZONA_REGEX.test(val), {
      message: CODIGO_FORMATO_MSG,
    }),
});

// ── Schema para edición (campos opcionales) ──────────────────────────────────
export const zonaEditSchema = zonaBaseSchema.partial().extend({
  codigo: zonaBaseSchema.shape.codigo
    .refine((val) => !val || CODIGO_ZONA_REGEX.test(val), {
      message: CODIGO_FORMATO_MSG,
    })
    .optional()
    .nullable(),
  circunscripcionId: zonaBaseSchema.shape.circunscripcionId.optional(),
});

// ── Tipos inferidos ──────────────────────────────────────────────────────────
export type ZonaFormInput = z.infer<typeof zonaFormSchema>;
export type ZonaEditInput = z.infer<typeof zonaEditSchema>;

// ── Helper para validar formulario ───────────────────────────────────────────
export interface ValidationResult {
  isValid: boolean;
  errors: Partial<Record<keyof FormState, string>>;
  data?: ZonaFormInput;
}

/**
 * Valida un formulario de Zona usando Zod
 * @param data - Los datos del formulario a validar
 * @param mode - 'create' o 'edit' para usar el schema adecuado
 * @returns Resultado de validación con errores formateados
 */
export const validateZonaForm = (
  data: unknown,
  mode: "crear" | "editar" = "crear",
): ValidationResult => {
  const schema = mode === "crear" ? zonaFormSchema : zonaEditSchema;
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

  return { isValid: true, data: result.data as ZonaFormInput, errors: {} };
};

// ── Validación de duplicados (lógica de negocio que requiere datos externos) ─
/**
 * Verifica si existe una Zona duplicada por nombre
 * Esta validación NO puede hacerse con Zod porque requiere acceso a la lista de Zonas existentes
 * @param nombre - Nombre de la zona a validar
 * @param existingZonas - Lista de zonas existentes desde el backend
 * @param editingId - ID del registro que se está editando (para excluirlo de la validación)
 * @returns Mensaje de error si hay duplicado, undefined si está OK
 */
export const validateZonaDuplicate = (
  nombre: string,
  existingZonas: getZonas[] | null,
  editingId?: string | null,
): string | undefined => {
  if (!existingZonas || !nombre.trim()) return undefined;

  const duplicado = existingZonas.find(
    (z) =>
      z.nombre.toLowerCase() === nombre.trim().toLowerCase() &&
      z.id !== editingId,
  );

  return duplicado ? "Ya existe una zona con ese nombre" : undefined;
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
export const resetZonaForm = (): FormState => ({
  nombre: "",
  codigo: "",
  activo: true,
  circunscripcionId: "",
});

/**
 * Validar formato de código en tiempo real (para feedback mientras escribe)
 */
export const validateCodigoFormat = (codigo: string): string | undefined => {
  if (!codigo) return undefined; // Vacío se valida como obligatorio en otro lado
  return CODIGO_ZONA_REGEX.test(codigo) ? undefined : CODIGO_FORMATO_MSG;
};
