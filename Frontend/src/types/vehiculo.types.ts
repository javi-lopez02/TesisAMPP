export type EstadoVehiculo =
  | "DISPONIBLE"
  | "EN_USO"
  | "MANTENIMIENTO"
  | "FUERA_DE_SERVICIO";

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
}
