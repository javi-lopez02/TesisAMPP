import type { User } from "../store/types";
import type { getConsejo } from "./consejo.types";

export interface getCircunscripcion {
  id: string;
  nombre: string;
  codigo: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;

  delegado: User;
  consejoPopular: getConsejo;
  _count?: {
    zonas: number;
    solicituds: number;
  };
}

export interface createCircunscripcion {
  nombre: string;
  codigo: string;
  activo: boolean;
  delegadoId: string;
  consejoPopularId: string;
}

export interface updateCircunscripcion {
  nombre: string;
  codigo: string;
  activo: boolean;
  delegadoId: string;
  consejoPopularId: string; 
}
