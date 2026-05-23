import type { getVehiculo } from "./vehiculo.types";

export type TipoMantenimiento = "Preventivo" | "Correctivo";

export interface createMantenimiento {
  tipo: TipoMantenimiento;
  descripcion: string;
  costo: number;
  kilometraje: number;
  fecha: string;
  vehiculoId: string;
}

export interface updateMantenimiento {
  tipo?: TipoMantenimiento;
  descripcion?: string;
  costo?: number;
  kilometraje?: number;
  fecha?: string;
}

export interface getMantenimiento {
  id: string;
  tipo: TipoMantenimiento;
  descripcion: string;
  costo: number;
  kilometraje: number;
  fecha: string;
  createdAt: string;
  updatedAt: string;
  vehiculo: getVehiculo;
}

export interface FormState {
  tipo: TipoMantenimiento;
  descripcion: string;
  costo: string;
  kilometraje: string;
  fecha: string;
  vehiculoId: string;
}
