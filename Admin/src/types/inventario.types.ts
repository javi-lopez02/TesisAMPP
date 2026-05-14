import type { getTipoCombustible } from "./tipo-combustible.types";

export interface getInventario {
  id: string;
  cantidadAsignada: number;
  saldoActual: number;
  fechaUltimaActualizacion: Date;
  tipoCombustible: getTipoCombustible;
  asamblea: { id: string; nombre: string; codigo: string };
  _count: {
    movimientos: number
  };
}

export interface createInventario {
  asambleaId: string;
  cantidadAsignada: number;
  saldoActual: number;
  tipoCombustibleId: string;
}

export interface updateInventario {
  cantidadAsignada: number;
  saldoActual: number;
}

// 🔹 Params opcionales para la consulta
export interface GetMovimientosParams {
  desde?: string | Date; // ISO string o Date
  hasta?: string | Date;
  limite?: number;
}

export interface FormState {
  asambleaId?: string;
  cantidadAsignada: string;
  saldoActual: string;
  tipoCombustibleId: string;
}
