import { z } from "zod";
import { EstadoAsignacion } from "../../generated/prisma/enums";

// Solo validación de parámetros de consulta (query string)
export const getAsignacionesSchema = z.object({
  estado: z.nativeEnum(EstadoAsignacion).optional(),
  vehiculoId: z.string().uuid().optional(),
  responsableId: z.string().uuid().optional(),
  solicitudId: z.string().uuid().optional(),
  desde: z.coerce.date().optional(), // Fecha de asignación inicio
  hasta: z.coerce.date().optional(), // Fecha de asignación fin
});

export type GetAsignacionesInput = z.infer<typeof getAsignacionesSchema>;