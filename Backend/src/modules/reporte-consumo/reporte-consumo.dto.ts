import { z } from "zod";

export const createReporteSchema = z.object({
  // El código se genera automáticamente, no se envía desde frontend
  consumoReal: z.coerce.number().positive("El consumo real debe ser mayor a 0"),
  kilometrajeRecorrido: z.coerce.number().nonnegative("El kilometraje no puede ser negativo"),
  rendimiento: z.coerce.number().min(0, "El rendimiento no puede ser negativo").optional(), // Se calcula si no se envía
  observaciones: z.string().optional(),
  asignacionId: z.string().uuid("ID de asignación inválido"),
  // usuarioId se toma del token autenticado, no del body
});

export const updateReporteSchema = z.object({
  consumoReal: z.coerce.number().positive().optional(),
  kilometrajeRecorrido: z.coerce.number().nonnegative().optional(),
  rendimiento: z.coerce.number().min(0).optional(),
  observaciones: z.string().optional().nullable(),
});

export type CreateReporteInput = z.infer<typeof createReporteSchema>;
export type UpdateReporteInput = z.infer<typeof updateReporteSchema>;