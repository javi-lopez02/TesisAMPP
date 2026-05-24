import { z } from "zod";
import { TipoPuntoRuta } from "../../generated/prisma/enums";

export const createPuntoRutaSchema = z.object({
  orden: z.coerce.number().int().min(0, "El orden debe ser >= 0"),
  tipo: z.nativeEnum(TipoPuntoRuta).optional(),
  nombre: z.string().min(2, "El nombre es obligatorio"),
  direccion: z.string(),
  rutaId: z.string().uuid("ID de Ruta inválido"),
  consejoPopularId: z.string().uuid(),
  circunscripcionId: z.string().uuid(),
  zonaId: z.string().uuid(),
  cdrId: z.string().uuid(),
});

export const updatePuntoRutaSchema = z.object({
  orden: z.coerce.number().int().min(0).optional(),
  tipo: z.nativeEnum(TipoPuntoRuta).optional(),
  nombre: z.string().min(2).optional(),
  direccion: z.string(),
  consejoPopularId: z.string().uuid(),
  circunscripcionId: z.string().uuid(),
  zonaId: z.string().uuid(),
  cdrId: z.string().uuid(),
});

export type CreatePuntoRutaInput = z.infer<typeof createPuntoRutaSchema>;
export type UpdatePuntoRutaInput = z.infer<typeof updatePuntoRutaSchema>;
