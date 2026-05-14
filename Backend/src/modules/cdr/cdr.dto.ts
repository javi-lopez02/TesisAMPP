import { z } from "zod";

export const createCdrSchema = z.object({
  numero: z.string().min(1, "El número de CDR es obligatorio"),
  direccion: z.string(),
  zonaId: z.string().uuid("ID de Zona inválido"),
  activo: z.boolean().optional(),
});

export const updateCdrSchema = z.object({
  numero: z.string().min(1).optional(),
  direccion: z.string().optional().nullable(),
  zonaId: z.string().uuid("ID de Zona inválido").optional(),
  activo: z.boolean().optional(),
});

export type CreateCdrInput = z.infer<typeof createCdrSchema>;
export type UpdateCdrInput = z.infer<typeof updateCdrSchema>;
