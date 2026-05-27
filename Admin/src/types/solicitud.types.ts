export type TipoSolicitud =
  | "FISCALIZACION"
  | "DISTRIBUCION"
  | "EMERGENCIA"
  | "OTRO";
export type TipoPuntoRuta = "INICIO" | "INTERMEDIO" | "DESTINO";

export interface PuntoRutaInput {
  orden: number;
  tipo: TipoPuntoRuta;
  nombre: string;
  direccion: string;
  consejoPopularId: string;
  circunscripcionId: string;
  zonaId: string;
  cdrId: string;
}

export interface createSolicitud {
  descripcion: string;
  actividad: string;
  tipoSolicitud: TipoSolicitud;
  fechaRequerida: string;
  cantidadLitros: number;
  tipoCombustibleId: string;
  distanciaTotal: number;
  tiempoEstimado: number;
  observaciones?: string;
  puntosRuta: PuntoRutaInput[];
}

export interface FormState {
  descripcion: string;
  actividad: string;
  tipoSolicitud: TipoSolicitud;
  fechaRequerida: string;
  cantidadLitros: string;
  tipoCombustibleId: string;
  observaciones: string;
  distanciaTotal: string;
  tiempoEstimado: string;
  puntosRuta: FormPuntoRuta[];
}

export interface FormPuntoRuta {
  id?: string; // Para identificar el punto en el UI (no se envía al backend)
  orden: string;
  tipo: TipoPuntoRuta;
  nombre: string;
  direccion: string;
  consejoPopularId: string;
  circunscripcionId: string;
  zonaId: string;
  cdrId: string;
}
