import { z } from "zod";

export const createDelegaciaSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  codigo: z.string().min(1, "El código es obligatorio"),
  consejoPopularId: z
    .string()
    .uuid("El ID del Consejo Popular debe ser un UUID válido"),
});

export const updateDelegaciaSchema = z.object({
  nombre: z.string().min(2).optional(),
  codigo: z.string().min(1).optional(),
  consejoPopularId: z.string().uuid().optional(),
});

export type CreateDelegaciaInput = z.infer<typeof createDelegaciaSchema>;
export type UpdateDelegaciaInput = z.infer<typeof updateDelegaciaSchema>;
