export type TipoMovimiento =
  | "ASIGNACION_INICIAL"
  | "ASIGNACION_SOLICITUD"
  | "DEVOLUCION"
  | "AJUSTE"
  | "MERMA";

export interface createMovimiento {
  tipo: TipoMovimiento;
  cantidad: number;
  observaciones: string;
  asambleaId: string;
  tipoCombustibleId: string;
  inventarioCombustibleId?: string;
}

export interface getMovimientoCombustible {
  id: string;
  tipo: TipoMovimiento;
  cantidad: number;
  saldoAnterior: number;
  saldoNuevo: number;
  observaciones: string | null;
  createdAt: string;

  usuario: {
    id: string;
    nombre: string;
    apellidos: string;
    rol: string;
  };
  tipoCombustible: {
    id: string;
    nombre: string;
    codigo: string;
  };
  inventarioCombustible?: {
    id: string;
    saldoActual: number;
  };
}

export interface FormState {
  tipo: TipoMovimiento;
  cantidad: string;
  observaciones: string;
  asambleaId: string;
  tipoCombustibleId: string;
  inventarioCombustibleId: string;
}