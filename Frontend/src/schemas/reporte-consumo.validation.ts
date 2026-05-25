import { z } from "zod";
import type { FormState } from "../types/reporte-consumo.types";

export const reporteFormSchema = z.object({
  consumoReal: z.coerce.number().positive("El consumo real debe ser mayor a 0"),
  kilometrajeRecorrido: z.coerce
    .number()
    .nonnegative("El kilometraje no puede ser negativo"),
  rendimiento: z.coerce
    .number()
    .min(0, "El rendimiento no puede ser negativo")
    .optional(),
  observaciones: z.string().optional(),
  asignacionId: z.string().uuid("ID de asignación inválido"),
});

export const reporteEditSchema = reporteFormSchema.partial();

export type ReporteFormInput = z.infer<typeof reporteFormSchema>;

export interface ValidationResult {
  isValid: boolean;
  errors: Partial<Record<keyof FormState, string>>;
}

export const validateReporteForm = (
  data: unknown,
  mode: "crear" | "editar" = "crear",
): ValidationResult => {
  const schema = mode === "crear" ? reporteFormSchema : reporteEditSchema;
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

export const resetReporteForm = (): FormState => ({
  consumoReal: "",
  kilometrajeRecorrido: "",
  rendimiento: "",
  observaciones: "",
  asignacionId: "",
});

export const validateNumeroFormat = (
  value: string,
  min: number,
  field: string,
): string | undefined => {
  if (!value) return undefined;
  const num = Number(value);
  if (isNaN(num)) return `Debe ser un número válido`;
  if (num < min) return `${field} debe ser >= ${min}`;
  return undefined;
};
