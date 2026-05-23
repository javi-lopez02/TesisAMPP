import type { getAsignacion } from "./asignacion.types";

export interface createReporte {
  consumoReal: number;
  kilometrajeRecorrido: number;
  rendimiento?: number;
  observaciones?: string;
  asignacionId: string;
}

export interface updateReporte {
  consumoReal?: number;
  kilometrajeRecorrido?: number;
  rendimiento?: number;
  observaciones?: string | null;
}

export interface getReporte {
  id: string;
  consumoReal: number;
  kilometrajeRecorrido: number;
  rendimiento: number | null;
  observaciones: string | null;
  createdAt: string;
  updatedAt: string;
  asignacion: getAsignacion;
  // usuarioId se obtiene del token, no se expone en el response si no es necesario
}

export interface FormState {
  consumoReal: string;
  kilometrajeRecorrido: string;
  rendimiento: string;
  observaciones: string;
  asignacionId: string;
}
