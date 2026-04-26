import { z } from "zod";

export const createTanqueSchema = z.object({
  nombre: z.string().min(2, "El nombre es obligatorio"),
  capacidadTotal: z.coerce
    .number()
    .positive("La capacidad total debe ser mayor a 0"),
  capacidadActual: z.coerce
    .number()
    .min(0, "La capacidad actual no puede ser negativa"),
  ubicacion: z.string().optional(),
  tipoCombustibleId: z.string().uuid("ID de tipo de combustible inválido"),
});

export const updateTanqueSchema = z.object({
  nombre: z.string().min(2).optional(),
  capacidadTotal: z.coerce.number().positive().optional(),
  capacidadActual: z.coerce.number().min(0).optional(),
  ubicacion: z.string().optional().nullable(),
  tipoCombustibleId: z.string().uuid().optional(),
});

export type CreateTanqueInput = z.infer<typeof createTanqueSchema>;
export type UpdateTanqueInput = z.infer<typeof updateTanqueSchema>;
