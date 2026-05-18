// src/validations/movimiento-combustible.validations.ts
import { z } from "zod";
import type { FormState } from "../types/movimiento.types";
import type { getInventario } from "../types/inventario.types";

// ── Constantes compartidas ──────────────────────────────────────────────────
export const CANTIDAD_MINIMA = 0.01;

// ── Schema base compartido con backend ───────────────────────────────────────
// Define las reglas que deben cumplirse SIEMPRE (frontend + backend)
export const movimientoBaseSchema = z.object({
  tipo: z.enum(
    [
      "ASIGNACION_INICIAL",
      "ASIGNACION_SOLICITUD",
      "DEVOLUCION",
      "AJUSTE",
      "MERMA",
    ],
    {
      message: "Tipo de movimiento inválido",
    },
  ),
  cantidad: z.coerce
    .number()
    .refine((val) => val > 0, { message: "La cantidad debe ser mayor a 0" }),
  observaciones: z.string().optional(),
  asambleaId: z.string().uuid({ message: "ID de Asamblea inválido" }),
  tipoCombustibleId: z
    .string()
    .uuid({ message: "ID de Tipo de Combustible inválido" }),
});

// ── Schema específico para frontend (con validaciones adicionales) ───────────
// Extiende el base con reglas que solo aplican en la UI
export const movimientoFormSchema = movimientoBaseSchema.extend({
  cantidad: movimientoBaseSchema.shape.cantidad.refine(
    (val) => val >= CANTIDAD_MINIMA,
    { message: `La cantidad mínima es ${CANTIDAD_MINIMA}` },
  ),
});

// ── Tipos inferidos ──────────────────────────────────────────────────────────
export type MovimientoFormInput = z.infer<typeof movimientoFormSchema>;

// ── Helper para validar formulario ───────────────────────────────────────────
export interface ValidationResult {
  isValid: boolean;
  errors: Partial<Record<keyof FormState, string>>;
  data?: MovimientoFormInput;
}

/**
 * Valida un formulario de Movimiento usando Zod
 * @param data - Los datos del formulario a validar
 * @returns Resultado de validación con errores formateados
 */
export const validateMovimientoForm = (data: unknown): ValidationResult => {
  const result = movimientoFormSchema.safeParse(data);

  if (!result.success) {
    // Convertir errores de Zod a formato amigable para el formulario
    const errors: Partial<Record<keyof FormState, string>> = {};

    result.error.issues.forEach((err) => {
      const field = err.path[0] as keyof FormState;
      if (field && !errors[field]) {
        errors[field] = err.message;
      }
    });

    console.log(errors)

    return { isValid: false, errors };
  }

  return { isValid: true, data: result.data, errors: {} };
};

// ── Validación de inventario (lógica de negocio que requiere datos externos) ─
/**
 * Verifica si existe un inventario para la combinación asamblea + tipoCombustible
 * Esta validación NO puede hacerse con Zod porque requiere acceso a la lista de inventarios
 * @param asambleaId - ID de la asamblea seleccionada
 * @param tipoCombustibleId - ID del tipo de combustible seleccionado
 * @param tipoMovimiento - Tipo de movimiento a realizar
 * @param inventarios - Lista de inventarios existentes desde el backend
 * @returns Mensaje de error si no hay inventario cuando se requiere, undefined si está OK
 */
export const validateInventarioExistence = (
  asambleaId: string,
  tipoCombustibleId: string,
  tipoMovimiento: string,
  inventarios: getInventario[] | null,
): string | undefined => {
  // ASIGNACION_INICIAL puede crear inventario, no requiere validación aquí
  if (tipoMovimiento === "ASIGNACION_INICIAL") {
    return undefined;
  }

  // Para otros tipos de movimiento, el inventario DEBE existir
  if (!inventarios) return "No se pudieron cargar los inventarios";

  const inventario = inventarios.find(
    (inv) =>
      inv.asamblea.id === asambleaId &&
      inv.tipoCombustible.id === tipoCombustibleId,
  );

  if (!inventario) {
    return `No existe inventario para este tipo de combustible en la asamblea seleccionada. Primero debe crear una "Asignación Inicial".`;
  }

  return undefined;
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
export const resetMovimientoForm = (): FormState => ({
  tipo: "ASIGNACION_INICIAL",
  cantidad: "",
  observaciones: "",
  asambleaId: "",
  tipoCombustibleId: "",
  inventarioCombustibleId: "",
});

/**
 * Validar formato de cantidad en tiempo real (para feedback mientras escribe)
 */
export const validateCantidadFormat = (
  cantidad: string,
): string | undefined => {
  if (!cantidad) return undefined; // Vacío se valida como obligatorio en otro lado
  const num = Number(cantidad);
  if (isNaN(num)) return "Debe ser un número válido";
  if (num <= 0) return "La cantidad debe ser mayor a 0";
  if (num < CANTIDAD_MINIMA) return `La cantidad mínima es ${CANTIDAD_MINIMA}`;
  return undefined;
};
