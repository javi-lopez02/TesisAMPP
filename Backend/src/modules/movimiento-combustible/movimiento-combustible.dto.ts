import { z } from "zod";
import { TipoMovimientoCombustible } from "../../generated/prisma/enums";

export const createMovimientoCombustibleSchema = z.object({
  tipo: z.nativeEnum(TipoMovimientoCombustible, {
    message: "Tipo de movimiento inválido",
  }),
  cantidad: z.coerce
    .number()
    .refine((val) => val !== 0, { message: "La cantidad no puede ser 0" }),
  observaciones: z.string().optional(),
  asambleaId: z.string().uuid("ID de Asamblea inválido"),
  tipoCombustibleId: z.string().uuid("ID de Tipo de Combustible inválido"),
  inventarioCombustibleId: z.string().uuid().optional(), // Opcional si es movimiento registral puro
});

export type CreateMovimientoCombustibleInput = z.infer<
  typeof createMovimientoCombustibleSchema
>;
