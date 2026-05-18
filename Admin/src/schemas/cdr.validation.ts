// src/validations/cdr.validations.ts
import { z } from "zod";
import type { getCdrs } from "../types/cdrs.types";

// ── Schema base compartido con backend ───────────────────────────────────────
// Este schema define las reglas que deben cumplirse SIEMPRE (frontend + backend)
export const cdrBaseSchema = z.object({
  numero: z.string().min(1, { message: "El número de CDR es obligatorio" }),
  direccion: z
    .string()
    .min(1, { message: "La dirección es obligatoria" })
    .trim(),
  zonaId: z.string().uuid({ message: "ID de Zona inválido" }),
  activo: z.boolean()
});

// ── Schema específico para frontend (con validaciones adicionales) ───────────
// Extiende el base con reglas que solo aplican en la UI
export const cdrFormSchema = cdrBaseSchema.extend({
  numero: z
    .string()
    .min(1, { message: "El número de CDR es obligatorio" })
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "El número debe ser válido y mayor a 0",
    }),
});

// ── Schema para edición (campos opcionales) ──────────────────────────────────
export const cdrEditSchema = cdrBaseSchema.partial().extend({
  numero: cdrBaseSchema.shape.numero
    .refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), {
      message: "El número debe ser válido y mayor a 0",
    })
    .optional(),
  direccion: cdrBaseSchema.shape.direccion.optional().nullable(),
  zonaId: cdrBaseSchema.shape.zonaId.optional(),
});

// ── Tipos inferidos ──────────────────────────────────────────────────────────
export type CdrFormInput = z.infer<typeof cdrFormSchema>;
export type CdrEditInput = z.infer<typeof cdrEditSchema>;

// ── Helper para validar formulario ───────────────────────────────────────────
export interface ValidationResult {
  isValid: boolean;
  errors: Partial<Record<keyof CdrFormInput, string>>;
  data?: CdrFormInput;
}

/**
 * Valida un formulario de CDR usando Zod
 * @param data - Los datos del formulario a validar
 * @param mode - 'crear' o 'edit' para usar el schema adecuado
 * @returns Resultado de validación con errores formateados
 */
export const validateCdrForm = (
  data: unknown,
  mode: "crear" | "editar" = "crear",
): ValidationResult => {
  const schema = mode === "crear" ? cdrFormSchema : cdrEditSchema;
  const result = schema.safeParse(data);

  if (!result.success) {
    // Convertir errores de Zod a formato amigable para el formulario
    const errors: Partial<Record<keyof CdrFormInput, string>> = {};

    result.error.issues.forEach((err) => {
      const field = err.path[0] as keyof CdrFormInput;
      if (field && !errors[field]) {
        errors[field] = err.message;
      }
    });

    return { isValid: false, errors };
  }

  return { isValid: true, data: result.data as CdrFormInput, errors: {} };
};

// ── Validación de duplicados (lógica de negocio que requiere datos externos) ─
/**
 * Verifica si existe un CDR duplicado por número + zona
 * Esta validación NO puede hacerse con Zod porque requiere acceso a la lista de CDRs existentes
 * @param numero - Número del CDR a validar
 * @param zonaId - ID de la zona seleccionada
 * @param existingCdrs - Lista de CDRs existentes desde el backend
 * @param editingId - ID del registro que se está editando (para excluirlo de la validación)
 * @returns Mensaje de error si hay duplicado, undefined si está OK
 */
export const validateCdrDuplicate = (
  numero: string,
  zonaId: string,
  existingCdrs: getCdrs[] | null,
  editingId?: string | null,
): string | undefined => {
  if (!existingCdrs || !numero || !zonaId) return undefined;

  const duplicado = existingCdrs.find(
    (c) =>
      c.numero.toString() === numero &&
      c.zona?.id === zonaId &&
      c.id !== editingId,
  );

  return duplicado
    ? "Ya existe un CDR con este número en la zona seleccionada"
    : undefined;
};

// ── Utilidades para UI ───────────────────────────────────────────────────────
/**
 * Formatea errores de Zod para mostrar en inputs individuales
 * Útil para validación en tiempo real (onChange)
 */
export const getFieldError = (
  error: z.ZodError | null,
  field: keyof CdrFormInput,
): string | undefined => {
  if (!error) return undefined;

  const fieldError = error.issues.find((err) => err.path[0] === field);
  return fieldError?.message;
};

/**
 * Resetear valores del formulario a estado inicial
 */
export const resetCdrForm = (): CdrFormInput => ({
  numero: "",
  direccion: "",
  zonaId: "",
  activo: true,
});
