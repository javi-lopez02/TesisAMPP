import { z } from "zod";
import { TipoPuntoRuta } from "../../generated/prisma/enums";

export const createPuntoRutaSchema = z.object({
  orden: z.coerce.number().int().min(0, "El orden debe ser >= 0"),
  tipo: z.nativeEnum(TipoPuntoRuta).optional(),
  nombre: z.string().min(2, "El nombre es obligatorio"),
  direccion: z.string().optional(),
  coordenadasLat: z.coerce.number().optional(),
  coordenadasLng: z.coerce.number().optional(),
  rutaId: z.string().uuid("ID de Ruta inválido"),
  consejoPopularId: z.string().uuid().optional(),
  circunscripcionId: z.string().uuid().optional(),
  zonaId: z.string().uuid().optional(),
  cdrId: z.string().uuid().optional(),
});

export const updatePuntoRutaSchema = z.object({
  orden: z.coerce.number().int().min(0).optional(),
  tipo: z.nativeEnum(TipoPuntoRuta).optional(),
  nombre: z.string().min(2).optional(),
  direccion: z.string().optional().nullable(),
  coordenadasLat: z.coerce.number().optional(),
  coordenadasLng: z.coerce.number().optional(),
  consejoPopularId: z.string().uuid().optional().nullable(),
  circunscripcionId: z.string().uuid().optional().nullable(),
  zonaId: z.string().uuid().optional().nullable(),
  cdrId: z.string().uuid().optional().nullable(),
});

export type CreatePuntoRutaInput = z.infer<typeof createPuntoRutaSchema>;
export type UpdatePuntoRutaInput = z.infer<typeof updatePuntoRutaSchema>;
