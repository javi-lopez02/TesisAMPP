import { z } from "zod";

export const createAsambleaSchema = z.object({
  nombre: z.string().min(2, "El nombre es obligatorio").optional(), // DB tiene default
  codigo: z.string().min(1, "El código es obligatorio"),
  servicentroNombre: z.string().min(2, "Nombre del servicentro obligatorio"),
  servicentroDireccion: z.string().optional(),
});

export const updateAsambleaSchema = z.object({
  nombre: z.string().min(2).optional(),
  codigo: z.string().min(1).optional(),
  servicentroNombre: z.string().min(2).optional(),
  servicentroDireccion: z.string().optional().nullable(),
});

export type CreateAsambleaInput = z.infer<typeof createAsambleaSchema>;
export type UpdateAsambleaInput = z.infer<typeof updateAsambleaSchema>;