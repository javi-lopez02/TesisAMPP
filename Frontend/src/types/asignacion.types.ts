import type { getVehiculo } from "./vehiculo.types";
import type { getUsuario } from "./usuarios.types";
// import type { getSolicitud } from "./solicitud.types";

export type EstadoAsignacion =
  | "PENDIENTE"
  | "EN_PROGRESO"
  | "COMPLETADA"
  | "CANCELADA";

export interface getAsignacion {
  id: string;
  estado: EstadoAsignacion;
  fechaAsignacion: string;
  fechaEntrega?: string | null;
  createdAt: string;
  updatedAt: string;

  vehiculo: getVehiculo;
  responsable: getUsuario;
  //   solicitud?: getSolicitud | null;

  _count?: {
    reportes?: number;
  };
}

export interface GetAsignacionesParams {
  estado?: EstadoAsignacion;
  vehiculoId?: string;
  responsableId?: string;
  solicitudId?: string;
  desde?: string;
  hasta?: string;
}
