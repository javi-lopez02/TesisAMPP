import { z } from "zod";

export const createCdrSchema = z.object({
  numero: z.string().min(1, "El número de CDR es obligatorio"),
  direccion: z.string().optional(),
  coordenadasLat: z.coerce.number().optional(),
  coordenadasLng: z.coerce.number().optional(),
  zonaId: z.string().uuid("ID de Zona inválido"),
});

export const updateCdrSchema = z.object({
  numero: z.string().min(1).optional(),
  direccion: z.string().optional().nullable(),
  coordenadasLat: z.coerce.number().optional(),
  coordenadasLng: z.coerce.number().optional(),
});

export type CreateCdrInput = z.infer<typeof createCdrSchema>;
export type UpdateCdrInput = z.infer<typeof updateCdrSchema>;
