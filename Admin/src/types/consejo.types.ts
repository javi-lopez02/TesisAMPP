import type { User } from "../store/types";

export interface createConsejo {
  nombre: string;
  codigo: string;
  activo: boolean;
}

export interface updateConsejo {
  nombre: string;
  codigo: string;
  activo: boolean;
}

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
