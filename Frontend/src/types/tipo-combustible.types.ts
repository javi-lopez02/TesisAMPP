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
    asignaciones: number;
  };
}
