import { z } from "zod";

export const createZonaSchema = z.object({
  nombre: z.string().min(2, "El nombre es obligatorio"),
  codigo: z.string().optional(),
  circunscripcionId: z.string().uuid("ID de Circunscripción inválido"),
});

export const updateZonaSchema = z.object({
  nombre: z.string().min(2).optional(),
  codigo: z.string().optional().nullable(),
});

export type CreateZonaInput = z.infer<typeof createZonaSchema>;
export type UpdateZonaInput = z.infer<typeof updateZonaSchema>;
