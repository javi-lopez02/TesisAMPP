// src/validations/vehiculo.validations.ts
import { z } from "zod";
import type {
  getVehiculo,
  FormState,
  EstadoVehiculo,
} from "../types/vehiculo.types";

// ── Constantes compartidas ──────────────────────────────────────────────────
export const ESTADOS_VEHICULO: EstadoVehiculo[] = [
  "DISPONIBLE",
  "EN_USO",
  "MANTENIMIENTO",
  "FUERA_DE_SERVICIO",
] as const;

export const PLACA_REGEX = /^[A-Z0-9-]{6,10}$/;
export const PLACA_FORMATO_MSG = "Formato: ABC-123 o ABC123 (6-10 caracteres)";

export const KILOMETRAJE_MINIMO = 0;
export const KILOMETRAJE_MAXIMO = 9999999;

export const CAPACIDAD_TANQUE_MINIMA = 10;
export const CAPACIDAD_TANQUE_MAXIMA = 10000;

// ── Schema base compartido con backend ───────────────────────────────────────
export const vehiculoBaseSchema = z.object({
  placa: z
    .string()
    .min(6, { message: "La placa debe tener al menos 6 caracteres" })
    .max(10, { message: "La placa no puede exceder 10 caracteres" }),
  marca: z.string().min(2, { message: "La marca es obligatoria" }),
  capacidadTanque: z.coerce
    .number()
    .min(CAPACIDAD_TANQUE_MINIMA, {
      message: `Mínimo ${CAPACIDAD_TANQUE_MINIMA}L`,
    })
    .max(CAPACIDAD_TANQUE_MAXIMA, {
      message: `Máximo ${CAPACIDAD_TANQUE_MAXIMA}L`,
    }),
  tipoCombustibleId: z
    .string()
    .uuid({ message: "ID de Tipo de Combustible inválido" }),
  estado: z.enum(ESTADOS_VEHICULO, { message: "Estado inválido" }),
  kilometraje: z.coerce
    .number()
    .min(KILOMETRAJE_MINIMO, {
      message: "El kilometraje no puede ser negativo",
    })
    .max(KILOMETRAJE_MAXIMO, { message: "Kilometraje excede el límite" }),
  choferId: z
    .string()
    .uuid({ message: "ID de Chofer inválido" })
    .optional()
    .or(z.literal("")),
  activo: z.boolean().optional(),
});

// ── Schema específico para frontend ──────────────────────────────────────────
export const vehiculoFormSchema = vehiculoBaseSchema.extend({
  placa: vehiculoBaseSchema.shape.placa.refine(
    (val) => !val || PLACA_REGEX.test(val.toUpperCase()),
    { message: PLACA_FORMATO_MSG },
  ),
  // En frontend, choferId puede ser string vacío para "sin asignar"
  choferId: z.string().optional(),
});

// ── Schema para edición ──────────────────────────────────────────────────────
export const vehiculoEditSchema = vehiculoBaseSchema.partial().extend({
  placa: vehiculoBaseSchema.shape.placa
    .refine((val) => !val || PLACA_REGEX.test(val.toUpperCase()), {
      message: PLACA_FORMATO_MSG,
    })
    .optional(),
  choferId: vehiculoBaseSchema.shape.choferId.optional().nullable(),
});

// ── Tipos inferidos ──────────────────────────────────────────────────────────
export type VehiculoFormInput = z.infer<typeof vehiculoFormSchema>;
export type VehiculoEditInput = z.infer<typeof vehiculoEditSchema>;

// ── Helper para validar formulario ───────────────────────────────────────────
export interface ValidationResult {
  isValid: boolean;
  errors: Partial<Record<keyof FormState, string>>;
  data?: VehiculoFormInput;
}

export const validateVehiculoForm = (
  data: unknown,
  mode: "crear" | "editar" = "crear",
): ValidationResult => {
  const schema = mode === "crear" ? vehiculoFormSchema : vehiculoEditSchema;
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors: Partial<Record<keyof FormState, string>> = {};

    result.error.issues.forEach((err) => {
      const field = err.path[0] as keyof FormState;
      if (field && !errors[field]) {
        errors[field] = err.message;
      }
    });

    return { isValid: false, errors };
  }

  return { isValid: true, data: result.data as VehiculoFormInput, errors: {} };
};

// ── Validación de duplicados ─────────────────────────────────────────────────
export const validateVehiculoDuplicate = (
  placa: string,
  existingVehiculos: getVehiculo[] | null,
  editingId?: string | null,
): string | undefined => {
  if (!existingVehiculos || !placa.trim()) return undefined;

  const duplicado = existingVehiculos.some(
    (v) =>
      v.placa.toLowerCase() === placa.trim().toLowerCase() &&
      v.id !== editingId,
  );

  return duplicado ? "Ya existe un vehículo con esta placa" : undefined;
};

// ── Validación condicional de chofer ─────────────────────────────────────────
export const validateChoferConditional = (
  estado: EstadoVehiculo,
  choferId: string,
): string | undefined => {
  // Si el vehículo está EN_USO, debe tener chofer asignado
  if (estado === "EN_USO" && !choferId) {
    return "Un vehículo en uso debe tener un chofer asignado";
  }
  return undefined;
};

// ── Utilidades para UI ───────────────────────────────────────────────────────
export const getFieldError = (
  error: z.ZodError | null,
  field: keyof FormState,
): string | undefined => {
  if (!error) return undefined;
  const fieldError = error.issues.find((err) => err.path[0] === field);
  return fieldError?.message;
};

export const resetVehiculoForm = (): FormState => ({
  placa: "",
  marca: "",
  capacidadTanque: "",
  tipoCombustibleId: "",
  estado: "DISPONIBLE",
  kilometraje: "",
  choferId: "",
});

export const validatePlacaFormat = (placa: string): string | undefined => {
  if (!placa) return undefined;
  return PLACA_REGEX.test(placa.toUpperCase()) ? undefined : PLACA_FORMATO_MSG;
};

export const validateNumeroFormat = (
  value: string,
  min: number,
  max: number,
  fieldName: string,
): string | undefined => {
  if (!value) return undefined;
  const num = Number(value);
  if (isNaN(num)) return `Debe ser un número válido`;
  if (num < min || num > max)
    return `${fieldName} debe estar entre ${min} y ${max}`;
  return undefined;
};