export interface createRuta {
  nombre: string;
  descripcion?: string;
  distanciaTotal: number;
  tiempoEstimado?: number;
}

export interface updateRuta {
  nombre?: string;
  descripcion?: string | null;
  distanciaTotal?: number;
  tiempoEstimado?: number | null;
}

export interface getRuta {
  id: string;
  nombre: string;
  descripcion: string | null;
  distanciaTotal: number;
  tiempoEstimado: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface FormState {
  nombre: string;
  descripcion: string;
  distanciaTotal: string;
  tiempoEstimado: string;
}