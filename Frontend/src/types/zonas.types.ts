import type { getCircunscripcion } from "./circunscripcion.types";

export interface getZonas {
  id: string;
  nombre: string;
  codigo: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;

  circunscripcion: getCircunscripcion;
  _count?: {
    cdrs: number;
    puntoRutas: number;
  };
}