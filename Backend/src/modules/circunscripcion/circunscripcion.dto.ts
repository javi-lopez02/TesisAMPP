import { z } from "zod";

export const createCircunscripcionSchema = z.object({
  nombre: z.string().min(2, "El nombre es obligatorio"),
  codigo: z.string().min(1, "El código es obligatorio"),
  consejoPopularId: z.string().uuid("ID de Consejo Popular inválido"),
  delegadoId: z.string().uuid().optional(),
});

export const updateCircunscripcionSchema = z.object({
  nombre: z.string().min(2).optional(),
  codigo: z.string().min(1).optional(),
  delegadoId: z.string().uuid().optional().nullable(),
});

export type CreateCircunscripcionInput = z.infer<
  typeof createCircunscripcionSchema
>;
export type UpdateCircunscripcionInput = z.infer<
  typeof updateCircunscripcionSchema
>;
