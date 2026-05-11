import type { getZonas } from "./zonas.types";

export interface getCdrs {
  id: string;
  numero: string;
  direccion: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;

  _count?: {
    puntoRutas: number;
  };
  zona: getZonas;
}

export interface createCdr {
  numero: string;
  direccion: string;
  activo: boolean;
  zonaId: string;
}

export interface updateCdr {
  numero: string;
  direccion: string;
  activo: boolean;
  zonaId: string;
}
