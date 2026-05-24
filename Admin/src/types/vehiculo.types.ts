import type { getTipoCombustible } from "./tipo-combustible.types";
import type { getUsuario } from "./usuarios.types";

export type EstadoVehiculo =
  | "DISPONIBLE"
  | "EN_USO"
  | "MANTENIMIENTO"
  | "FUERA_DE_SERVICIO";

export interface createVehiculo {
  placa: string;
  marca: string;
  capacidadTanque: number;
  tipoCombustibleId: string;
  estado: EstadoVehiculo;
  kilometraje: number;
  choferId?: string;
}

export interface updateVehiculo {
  placa: string;
  marca: string;
  capacidadTanque: number;
  tipoCombustibleId: string;
  estado: EstadoVehiculo;
  kilometraje: number;
  choferId?: string;
}

export interface getVehiculo {
  id: string;
  placa: string;
  marca: string;
  capacidadTanque: number;
  tipoCombustibleId: string;
  estado: EstadoVehiculo;
  kilometraje: number;
  choferId: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;

  tipoCombustible: getTipoCombustible;
  chofer: getUsuario;
  _count: {
    mantenimientos: number;
    asignaciones: number;
  };
}

export interface FormState {
  placa: string;
  marca: string;
  capacidadTanque: string;
  tipoCombustibleId: string;
  estado: EstadoVehiculo;
  kilometraje: string;
  choferId: string;
}
