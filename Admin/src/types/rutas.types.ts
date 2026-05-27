import type { getCircunscripcion } from "./circunscripcion.types";
import type { getConsejo } from "./consejo.types";

export type TipoPuntoRuta = "INICIO" | "INTERMEDIO" | "DESTINO";

export interface getPuntoRuta {
  id: string;
  orden: number;
  tipo: TipoPuntoRuta;
  nombre: string;
  direccion: string;
  consejoPopular: { id: string; nombre: string; codigo?: string };
  circunscripcion: { id: string; nombre: string; codigo?: string };
  zona: { id: string; nombre: string; codigo?: string };
  cdr: { id: string; numero: string };
}

export interface getRuta {
  id: string;
  nombre: string;
  descripcion: string;
  distanciaTotal: number;
  tiempoEstimado: number;
  activa: boolean | null;
  createdAt: string;
  updatedAt: string;
  puntos: getPuntoRuta[];
  consejoPopular: getConsejo;
  circunscripcion: getCircunscripcion;
  _count?: { solicitudes?: number; asignaciones?: number };
}
