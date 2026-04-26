import { z } from "zod";

export const createTipoCombustibleSchema = z.object({
  nombre: z.string().min(2, "El nombre es obligatorio"),
  codigo: z.string().min(1, "El código es obligatorio"),
  precioPorLitro: z.coerce.number().positive("El precio debe ser mayor a 0"),
});

export const updateTipoCombustibleSchema = z.object({
  nombre: z.string().min(2).optional(),
  codigo: z.string().min(1).optional(),
  precioPorLitro: z.coerce.number().positive().optional(),
});

export type CreateTipoCombustibleInput = z.infer<
  typeof createTipoCombustibleSchema
>;
export type UpdateTipoCombustibleInput = z.infer<
  typeof updateTipoCombustibleSchema
>;
