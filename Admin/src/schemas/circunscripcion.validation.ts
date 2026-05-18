// src/validations/circunscripcion.validations.ts
import { z } from "zod";
import type {
  getCircunscripcion,
  FormState,
} from "../types/circunscripcion.types";

// ── Constantes compartidas ──────────────────────────────────────────────────
export const CODIGO_CIRCUNSCRIPCION_REGEX = /^C-[A-Z]{2,6}-\d{3}$/;
export const CODIGO_FORMATO_MSG = "Formato: C-XXX-000";

// ── Schema base compartido con backend ───────────────────────────────────────
// Define las reglas que deben cumplirse SIEMPRE (frontend + backend)
export const circunscripcionBaseSchema = z.object({
  nombre: z.string().min(2, { message: "El nombre es obligatorio" }),
  codigo: z.string().min(1, { message: "El código es obligatorio" }),
  consejoPopularId: z
    .string()
    .uuid({ message: "ID de Consejo Popular inválido" }),
  delegadoId: z
    .string()
    .uuid({ message: "ID de Delegado inválido" })
    .optional(),
  activo: z.boolean().optional(),
});

// ── Schema específico para frontend (con validaciones adicionales) ───────────
// Extiende el base con reglas que solo aplican en la UI
export const circunscripcionFormSchema = circunscripcionBaseSchema.extend({
  codigo: circunscripcionBaseSchema.shape.codigo.refine(
    (val) => !val || CODIGO_CIRCUNSCRIPCION_REGEX.test(val),
    { message: CODIGO_FORMATO_MSG },
  ),
});

// ── Schema para edición (campos opcionales) ──────────────────────────────────
export const circunscripcionEditSchema = circunscripcionBaseSchema
  .partial()
  .extend({
    codigo: circunscripcionBaseSchema.shape.codigo
      .refine((val) => !val || CODIGO_CIRCUNSCRIPCION_REGEX.test(val), {
        message: CODIGO_FORMATO_MSG,
      })
      .optional()
      .nullable(),
    consejoPopularId:
      circunscripcionBaseSchema.shape.consejoPopularId.optional(),
    delegadoId: circunscripcionBaseSchema.shape.delegadoId
      .optional()
      .nullable(),
  });

// ── Tipos inferidos ──────────────────────────────────────────────────────────
export type CircunscripcionFormInput = z.infer<
  typeof circunscripcionFormSchema
>;
export type CircunscripcionEditInput = z.infer<
  typeof circunscripcionEditSchema
>;

// ── Helper para validar formulario ───────────────────────────────────────────
export interface ValidationResult {
  isValid: boolean;
  errors: Partial<Record<keyof FormState, string>>;
  data?: CircunscripcionFormInput;
}

/**
 * Valida un formulario de Circunscripción usando Zod
 * @param data - Los datos del formulario a validar
 * @param mode - 'create' o 'edit' para usar el schema adecuado
 * @returns Resultado de validación con errores formateados
 */
export const validateCircunscripcionForm = (
  data: unknown,
  mode: "crear" | "editar" = "crear",
): ValidationResult => {
  const schema =
    mode === "crear" ? circunscripcionFormSchema : circunscripcionEditSchema;
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

  return {
    isValid: true,
    data: result.data as CircunscripcionFormInput,
    errors: {},
  };
};

// ── Validación de duplicados (lógica de negocio que requiere datos externos) ─
/**
 * Verifica si existe una Circunscripción duplicada por nombre
 * Esta validación NO puede hacerse con Zod porque requiere acceso a la lista existente
 * @param nombre - Nombre de la circunscripción a validar
 * @param existingCircunscripciones - Lista de circunscripciones existentes desde el backend
 * @param editingId - ID del registro que se está editando (para excluirlo de la validación)
 * @returns Mensaje de error si hay duplicado, undefined si está OK
 */
export const validateCircunscripcionDuplicate = (
  nombre: string,
  existingCircunscripciones: getCircunscripcion[] | null,
  editingId?: string | null,
): string | undefined => {
  if (!existingCircunscripciones || !nombre.trim()) return undefined;

  const duplicado = existingCircunscripciones.find(
    (c) =>
      c.nombre.toLowerCase() === nombre.trim().toLowerCase() &&
      c.id !== editingId,
  );

  return duplicado ? "Ya existe una circunscripción con ese nombre" : undefined;
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
export const resetCircunscripcionForm = (): FormState => ({
  nombre: "",
  codigo: "",
  activo: true,
  delegadoId: "",
  consejoPopularId: "",
});

/**
 * Validar formato de código en tiempo real (para feedback mientras escribe)
 */
export const validateCodigoFormat = (codigo: string): string | undefined => {
  if (!codigo) return undefined; // Vacío se valida como obligatorio en otro lado
  return CODIGO_CIRCUNSCRIPCION_REGEX.test(codigo)
    ? undefined
    : CODIGO_FORMATO_MSG;
};
