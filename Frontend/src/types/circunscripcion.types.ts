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