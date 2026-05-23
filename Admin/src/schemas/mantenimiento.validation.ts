import { z } from "zod";
import type {
  FormState,
  TipoMantenimiento,
} from "../types/mantenimiento.types";

export const TIPOS_MANTENIMIENTO: TipoMantenimiento[] = [
  "Preventivo",
  "Correctivo",
] as const;

export const mantenimientoFormSchema = z.object({
  tipo: z.enum(TIPOS_MANTENIMIENTO, {
    message: "Tipo debe ser 'Preventivo' o 'Correctivo'",
  }),
  descripcion: z
    .string()
    .min(5, "La descripción debe tener al menos 5 caracteres"),
  costo: z.coerce.number().nonnegative("El costo no puede ser negativo"),
  kilometraje: z.coerce
    .number()
    .nonnegative("El kilometraje no puede ser negativo"),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato: YYYY-MM-DD"),
  vehiculoId: z.string().uuid("ID de vehículo inválido"),
});

export const mantenimientoEditSchema = mantenimientoFormSchema.partial();

export type MantenimientoFormInput = z.infer<typeof mantenimientoFormSchema>;

export interface ValidationResult {
  isValid: boolean;
  errors: Partial<Record<keyof FormState, string>>;
}

export const validateMantenimientoForm = (
  data: unknown,
  mode: "crear" | "editar" = "crear",
): ValidationResult => {
  const schema =
    mode === "crear" ? mantenimientoFormSchema : mantenimientoEditSchema;
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors: Partial<Record<keyof FormState, string>> = {};
    result.error.issues.forEach((err) => {
      const field = err.path[0] as keyof FormState;
      if (field && !errors[field]) errors[field] = err.message;
    });
    return { isValid: false, errors };
  }
  return { isValid: true, errors: {} };
};

export const resetMantenimientoForm = (): FormState => ({
  tipo: "Preventivo",
  descripcion: "",
  costo: "",
  kilometraje: "",
  fecha: new Date().toISOString().split("T")[0],
  vehiculoId: "",
});

export const validateNumeroFormat = (
  value: string,
  min: number,
  field: string,
): string | undefined => {
  if (!value) return undefined;
  const num = Number(value);
  if (isNaN(num)) return `Debe ser un número válido`;
  if (num < min) return `${field} no puede ser negativo`;
  return undefined;
};
