// src/validations/tipo-combustible.validations.ts
import { z } from "zod";
import type {
  getTipoCombustible,
  FormState,
} from "../types/tipo-combustible.types";

// ── Constantes compartidas ──────────────────────────────────────────────────
export const CODIGO_REGEX = /^[A-Z0-9]{1,8}$/;
export const CODIGO_FORMATO_MSG =
  "Solo letras mayúsculas y números, máx. 8 caracteres";

export const PRECIO_MINIMO = 0.01;
export const PRECIO_MAXIMO = 999999.99;
export const PRECIO_FORMATO_MSG = `Debe ser entre $${PRECIO_MINIMO} y $${PRECIO_MAXIMO}`;

// ── Schema base compartido con backend ───────────────────────────────────────
// Define las reglas que deben cumplirse SIEMPRE (frontend + backend)
export const tipoCombustibleBaseSchema = z.object({
  nombre: z.string().min(2, { message: "El nombre es obligatorio" }),
  codigo: z.string().min(1, { message: "El código es obligatorio" }),
  precioPorLitro: z.coerce
    .number()
    .positive({ message: "El precio debe ser mayor a 0" }),
});

// ── Schema específico para frontend (con validaciones adicionales) ───────────
// Extiende el base con reglas que solo aplican en la UI
export const tipoCombustibleFormSchema = tipoCombustibleBaseSchema.extend({
  codigo: tipoCombustibleBaseSchema.shape.codigo.refine(
    (val) => !val || CODIGO_REGEX.test(val),
    { message: CODIGO_FORMATO_MSG },
  ),
  precioPorLitro: tipoCombustibleBaseSchema.shape.precioPorLitro.refine(
    (val) => val >= PRECIO_MINIMO && val <= PRECIO_MAXIMO,
    { message: PRECIO_FORMATO_MSG },
  ),
});

// ── Schema para edición (campos opcionales) ──────────────────────────────────
export const tipoCombustibleEditSchema = tipoCombustibleBaseSchema
  .partial()
  .extend({
    codigo: tipoCombustibleBaseSchema.shape.codigo
      .refine((val) => !val || CODIGO_REGEX.test(val), {
        message: CODIGO_FORMATO_MSG,
      })
      .optional()
      .nullable(),
    precioPorLitro: tipoCombustibleBaseSchema.shape.precioPorLitro
      .refine((val) => !val || (val >= PRECIO_MINIMO && val <= PRECIO_MAXIMO), {
        message: PRECIO_FORMATO_MSG,
      })
      .optional(),
    activo: z.boolean().optional(),
  });

// ── Tipos inferidos ──────────────────────────────────────────────────────────
export type TipoCombustibleFormInput = z.infer<
  typeof tipoCombustibleFormSchema
>;
export type TipoCombustibleEditInput = z.infer<
  typeof tipoCombustibleEditSchema
>;

// ── Helper para validar formulario ───────────────────────────────────────────
export interface ValidationResult {
  isValid: boolean;
  errors: Partial<Record<keyof FormState, string>>;
  data?: TipoCombustibleFormInput;
}

/**
 * Valida un formulario de TipoCombustible usando Zod
 * @param data - Los datos del formulario a validar
 * @param mode - 'crear' o 'editar' para usar el schema adecuado
 * @returns Resultado de validación con errores formateados
 */
export const validateTipoCombustibleForm = (
  data: unknown,
  mode: "crear" | "editar" = "crear",
): ValidationResult => {
  const schema =
    mode === "crear" ? tipoCombustibleFormSchema : tipoCombustibleEditSchema;
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
    data: result.data as TipoCombustibleFormInput,
    errors: {},
  };
};

// ── Validación de duplicados (lógica de negocio que requiere datos externos) ─
/**
 * Verifica si existe un TipoCombustible duplicado por nombre
 * Esta validación NO puede hacerse con Zod porque requiere acceso a la lista existente
 * @param nombre - Nombre del tipo de combustible a validar
 * @param existingTipos - Lista de tipos existentes desde el backend
 * @param editingId - ID del registro que se está editando (para excluirlo de la validación)
 * @returns Mensaje de error si hay duplicado, undefined si está OK
 */
export const validateTipoCombustibleDuplicate = (
  nombre: string,
  existingTipos: getTipoCombustible[] | null,
  editingId?: string | null,
): string | undefined => {
  if (!existingTipos || !nombre.trim()) return undefined;

  const duplicado = existingTipos.find(
    (t) =>
      t.nombre.toLowerCase() === nombre.trim().toLowerCase() &&
      t.id !== editingId,
  );

  return duplicado ? "Ya existe un tipo con ese nombre" : undefined;
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
export const resetTipoCombustibleForm = (): FormState => ({
  nombre: "",
  codigo: "",
  precioPorLitro: "",
  activo: true,
});

/**
 * Validar formato de código en tiempo real (para feedback mientras escribe)
 */
export const validateCodigoFormat = (codigo: string): string | undefined => {
  if (!codigo) return undefined; // Vacío se valida como obligatorio en otro lado
  return CODIGO_REGEX.test(codigo) ? undefined : CODIGO_FORMATO_MSG;
};

/**
 * Validar formato de precio en tiempo real (para feedback mientras escribe)
 */
export const validatePrecioFormat = (precio: string): string | undefined => {
  if (!precio) return undefined; // Vacío se valida como obligatorio en otro lado
  const num = Number(precio);
  if (isNaN(num)) return "Debe ser un número válido";
  if (num < PRECIO_MINIMO || num > PRECIO_MAXIMO) return PRECIO_FORMATO_MSG;
  return undefined;
};
