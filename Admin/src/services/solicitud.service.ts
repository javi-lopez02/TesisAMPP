import type { createSolicitud } from "../types/solicitud.types";
import axios from "./axios.service";

export const getSolicitudRequest = () => {
  return axios.get("/solicitudes");
};

export const createSolicitudRequest = (solicitud: createSolicitud) => {
  return axios.post("/solicitudes", solicitud);
};

export const aprobarSolicitudRequest = (id: string, observaciones?: string) => {
  return axios.post(`/solicitudes/${id}/approve`, {
    observaciones: observaciones?.trim() || undefined,
  });
};

export const rechazarSolicitudRequest = (id: string, motivo: string) => {
  return axios.post(`/solicitudes/${id}/reject`, { motivo: motivo.trim() });
};
