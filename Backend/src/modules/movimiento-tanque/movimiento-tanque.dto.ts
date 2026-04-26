import { z } from "zod";
import { TipoMovimiento } from "../../generated/prisma";

export const createMovimientoSchema = z.object({
  tipo: z.nativeEnum(TipoMovimiento, { error: "Tipo de movimiento inválido" }),
  cantidad: z.coerce.number().positive("La cantidad debe ser mayor a 0"),
  observaciones: z.string().optional(),
  tanqueId: z.string().uuid("ID de tanque inválido"),
  usuarioId: z.string().uuid("ID de usuario inválido"),
  // Para AJUSTE, se requiere saldoNuevo explícito
  saldoNuevo: z.coerce.number().min(0).optional(),
});

export const updateMovimientoSchema = z.object({
  observaciones: z.string().optional().nullable(),
});

export type CreateMovimientoInput = z.infer<typeof createMovimientoSchema>;
export type UpdateMovimientoInput = z.infer<typeof updateMovimientoSchema>;
