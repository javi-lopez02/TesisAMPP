import { z } from "zod";
import {
  TipoSolicitud,
  EstadoSolicitud,
  TipoPuntoRuta,
} from "../../generated/prisma/enums";

export const createSolicitudSchema = z.object({
  descripcion: z.string().min(10, "Descripción muy corta"),
  actividad: z.string().min(2, "Actividad requerida"),
  tipoSolicitud: z.nativeEnum(TipoSolicitud).optional(),
  fechaRequerida: z.coerce
    .date()
    .refine((d) => d > new Date(), "La fecha debe ser futura"),
  cantidadLitros: z.coerce.number().positive("Cantidad debe ser mayor a 0"),
  tipoCombustibleId: z.string().uuid("Tipo de combustible requerido"),
  consejoPopularId: z.string().uuid().optional(),
  circunscripcionId: z.string().uuid().optional(),
  observaciones: z.string().optional(),

  puntosRuta: z
    .array(
      z.object({
        orden: z.coerce.number().int().min(0),
        tipo: z.nativeEnum(TipoPuntoRuta).optional(),
        nombre: z.string().min(2, "Nombre del punto requerido"),
        direccion: z.string().min(5, "Dirección exacta requerida"),
        consejoPopularId: z.string().uuid("Consejo Popular requerido"),
        circunscripcionId: z.string().uuid("Circunscripción requerida"),
        zonaId: z.string().uuid("Zona requerida"),
        cdrId: z.string().uuid("CDR requerido"),
      }),
    )
    .min(2, "La ruta debe tener al menos 2 puntos (inicio y destino)"),
});

export const approveSolicitudSchema = z.object({
  observaciones: z.string().optional(), // Para registrar motivo de aprobación
});

export const rejectSolicitudSchema = z.object({
  motivo: z.string().min(5, "Debe especificar el motivo del rechazo"),
});

export const cancelSolicitudSchema = z.object({
  motivo: z.string().min(5, "Debe especificar el motivo de la cancelación"),
});

export const getSolicitudesSchema = z.object({
  estado: z.nativeEnum(EstadoSolicitud).optional(),
  tipoSolicitud: z.nativeEnum(TipoSolicitud).optional(),
  usuarioId: z.string().uuid().optional(),
  tipoCombustibleId: z.string().uuid().optional(),
  desde: z.coerce.date().optional(),
  hasta: z.coerce.date().optional(),
});

export type CreateSolicitudInput = z.infer<typeof createSolicitudSchema>;
export type ApproveInput = z.infer<typeof approveSolicitudSchema>;
export type RejectInput = z.infer<typeof rejectSolicitudSchema>;
export type CancelInput = z.infer<typeof cancelSolicitudSchema>;
export type GetSolicitudesInput = z.infer<typeof getSolicitudesSchema>;
