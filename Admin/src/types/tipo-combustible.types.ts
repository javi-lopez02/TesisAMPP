export interface getTipoCombustible {
  id: string;
  nombre: string;
  codigo: string;
  precioPorLitro: number;
  activo: boolean;
  createdAt: string;
  updatedAt?: string;

  _count: {
    vehiculos: number;
    inventarioCombustibles: number;
    movimientoCombustibles: number;
    solicituds: number;
    asignacions: number;
  };
}

export interface createTipoCombustible {
  nombre: string;
  codigo: string;
  precioPorLitro: number;
  // tipoCombustibleId: string;
  activo: boolean;
}

export interface updateTipoCombustible {
  nombre: string;
  codigo: string;
  precioPorLitro: number;
  activo?: boolean;
}

export interface FormState {
  nombre: string;
  codigo: string;
  activo: boolean;
  precioPorLitro: string; // string para el input, se convierte al enviar
}
