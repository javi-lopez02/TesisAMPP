import { z } from "zod";

export const createInventarioSchema = z.object({
  asambleaId: z.string().uuid("ID de Asamblea inválido"),
  tipoCombustibleId: z.string().uuid("ID de tipo de combustible inválido"),
  cantidadAsignada: z.coerce
    .number()
    .min(0, "La cantidad asignada no puede ser negativa"),
  saldoActual: z.coerce
    .number()
    .min(0, "El saldo actual no puede ser negativo"),
});

export const updateInventarioSchema = z.object({
  cantidadAsignada: z.coerce.number().min(0).optional(),
  saldoActual: z.coerce.number().min(0).optional(),
});

export type CreateInventarioInput = z.infer<typeof createInventarioSchema>;
export type UpdateInventarioInput = z.infer<typeof updateInventarioSchema>;
