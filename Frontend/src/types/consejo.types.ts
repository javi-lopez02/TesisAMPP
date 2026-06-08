import type { User } from "../store/types";

export interface getConsejo {
  id: string;
  nombre: string;
  codigo: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    circunscripciones: number;
    solicituds: number;
  };
  presidente: User;
}