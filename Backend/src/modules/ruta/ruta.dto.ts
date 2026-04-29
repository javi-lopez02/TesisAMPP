import { z } from "zod";

export const createRutaSchema = z.object({
  nombre: z.string().min(2, "El nombre es obligatorio"),
  descripcion: z.string().optional(),
  distanciaTotal: z.coerce.number().positive("La distancia debe ser mayor a 0"),
  tiempoEstimado: z.coerce.number().int().positive().optional(),
});

export const updateRutaSchema = z.object({
  nombre: z.string().min(2).optional(),
  descripcion: z.string().optional().nullable(),
  distanciaTotal: z.coerce.number().positive().optional(),
  tiempoEstimado: z.coerce.number().int().positive().optional().nullable(),
});

export type CreateRutaInput = z.infer<typeof createRutaSchema>;
export type UpdateRutaInput = z.infer<typeof updateRutaSchema>;