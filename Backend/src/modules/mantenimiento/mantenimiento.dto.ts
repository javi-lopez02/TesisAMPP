import { z } from "zod";

export const createMantenimientoSchema = z.object({
  tipo: z.enum(["Preventivo", "Correctivo"], {
    message: "Tipo debe ser 'Preventivo' o 'Correctivo'",
  }),
  descripcion: z
    .string()
    .min(5, "La descripción debe tener al menos 5 caracteres"),
  costo: z.coerce.number().nonnegative("El costo no puede ser negativo"),
  kilometraje: z.coerce
    .number()
    .nonnegative("El kilometraje no puede ser negativo"),
  fecha: z.coerce.date({
    message: "Fecha inválida (usa formato ISO: YYYY-MM-DD)",
  }),
  vehiculoId: z.string().uuid("ID de vehículo inválido"),
});

export const updateMantenimientoSchema = z.object({
  tipo: z.enum(["Preventivo", "Correctivo"]).optional(),
  descripcion: z.string().min(5).optional(),
  costo: z.coerce.number().nonnegative().optional(),
  kilometraje: z.coerce.number().nonnegative().optional(),
  fecha: z.coerce.date().optional(),
});

export type CreateMantenimientoInput = z.infer<
  typeof createMantenimientoSchema
>;
export type UpdateMantenimientoInput = z.infer<
  typeof updateMantenimientoSchema
>;
