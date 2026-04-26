import { z } from "zod";

// Eliminados: direccion, telefono
export const createConsejoSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  codigo: z.string().min(1, "El código es obligatorio"),
});

export const updateConsejoSchema = z.object({
  nombre: z.string().min(2).optional(),
  codigo: z.string().min(1).optional(),
});

export type CreateConsejoInput = z.infer<typeof createConsejoSchema>;
export type UpdateConsejoInput = z.infer<typeof updateConsejoSchema>;
