import { z } from "zod";
import { EstadoVehiculo } from "../../generated/prisma";

// Eliminados: modelo, anio, color
export const createVehiculoSchema = z.object({
  placa: z.string().min(1, "La placa es obligatoria"),
  marca: z.string().min(1, "La marca es obligatoria"),
  capacidadTanque: z.coerce
    .number()
    .positive("La capacidad debe ser mayor a 0"),
  tipoCombustibleId: z.string().uuid("ID de tipo de combustible inválido"),
  estado: z.nativeEnum(EstadoVehiculo).optional(),
  kilometraje: z.coerce
    .number()
    .nonnegative("El kilometraje no puede ser negativo"),
  choferId: z.string().uuid().optional(),
});

export const updateVehiculoSchema = z.object({
  placa: z.string().min(1).optional(),
  marca: z.string().min(1).optional(),
  capacidadTanque: z.coerce.number().positive().optional(),
  tipoCombustibleId: z.string().uuid().optional(),
  estado: z.nativeEnum(EstadoVehiculo).optional(),
  kilometraje: z.coerce.number().nonnegative().optional(),
  choferId: z.string().uuid().optional().nullable(),
});

export type CreateVehiculoInput = z.infer<typeof createVehiculoSchema>;
export type UpdateVehiculoInput = z.infer<typeof updateVehiculoSchema>;
