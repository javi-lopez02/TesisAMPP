import { z } from "zod";
import {
  TipoSolicitud,
  EstadoSolicitud,
  TipoPuntoRuta,
} from "../../generated/prisma/enums";

// ── Crear Solicitud ─────────────────────────────────────────────
export const createSolicitudSchema = z.object({
  descripcion: z.string().min(10, "Descripción muy corta"),
  actividad: z.string().min(2, "Actividad requerida"),
  tipoSolicitud: z.nativeEnum(TipoSolicitud).optional(),
  fechaRequerida: z.coerce
    .date()
    .refine((d) => d > new Date(), "Fecha requerida debe ser futura"),
  cantidadLitros: z.coerce.number().positive("Cantidad debe ser mayor a 0"),
  tipoCombustibleId: z.string().uuid("Tipo de combustible requerido"),
  consejoPopularId: z.string().uuid().optional(),
  circunscripcionId: z.string().uuid().optional(),

  // 🔹 Puntos de ruta seleccionados de la jerarquía territorial
  puntosRuta: z
    .array(
      z.object({
        orden: z.coerce.number().int().min(0),
        tipo: z.nativeEnum(TipoPuntoRuta).optional(),
        nombre: z.string().min(2),
        direccion: z.string().optional(),
        coordenadasLat: z.coerce.number().optional(),
        coordenadasLng: z.coerce.number().optional(),
        // Solo UNO de estos debe estar presente por punto
        consejoPopularId: z.string().uuid().optional(),
        circunscripcionId: z.string().uuid().optional(),
        zonaId: z.string().uuid().optional(),
        cdrId: z.string().uuid().optional(),
      }),
    )
    .min(2, "La ruta debe tener al menos 2 puntos (inicio y destino)"),
});

// ── Transiciones de estado (NO hay update general) ───────────────
export const approveSolicitudSchema = z.object({
  vehiculoId: z.string().uuid("Vehículo requerido para la asignación"),
  responsableId: z.string().uuid("Responsable requerido"),
  choferId: z.string().uuid().optional(),
  observaciones: z.string().optional(),
});

export const rejectSolicitudSchema = z.object({
  motivo: z.string().min(5, "Debe especificar el motivo del rechazo"),
});

export const cancelSolicitudSchema = z.object({
  motivo: z.string().min(5, "Debe especificar el motivo de la cancelación"),
});

// ── Tipos exportados ────────────────────────────────────────────
export type CreateSolicitudInput = z.infer<typeof createSolicitudSchema>;
export type ApproveSolicitudInput = z.infer<typeof approveSolicitudSchema>;
export type RejectSolicitudInput = z.infer<typeof rejectSolicitudSchema>;
export type CancelSolicitudInput = z.infer<typeof cancelSolicitudSchema>;
