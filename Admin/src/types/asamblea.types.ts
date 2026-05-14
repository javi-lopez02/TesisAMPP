export interface getAsamblea {
  id: string;
  nombre: string;
  codigo: string;
  servicentroNombre: string;
  servicentroDireccion: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;

  _count?: {
    inventarios: number;
    movimientosCombustible: number;
    asignacions: number;
  };
}

export interface createAsamblea {
  nombre: string;
  codigo: string;
  servicentroNombre: string;
  servicentroDireccion: string;
}

export interface updateAsamblea {
  nombre: string;
  codigo: string;
  servicentroNombre: string;
  servicentroDireccion: string;
}
