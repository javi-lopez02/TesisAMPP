import type {
  createSolicitud,
  GetSolicitudesInput,
} from "../types/solicitud.types";
import axios from "./axios.service";

const buildSolicitudesQuery = (filters?: GetSolicitudesInput): string => {
  if (!filters) return "";

  const qs = new URLSearchParams();

  if (filters.estado) qs.append("estado", filters.estado);
  if (filters.tipoSolicitud) qs.append("tipoSolicitud", filters.tipoSolicitud);
  if (filters.usuarioId) qs.append("usuarioId", filters.usuarioId); // 🔹 Filtro clave
  if (filters.tipoCombustibleId)
    qs.append("tipoCombustibleId", filters.tipoCombustibleId);
  if (filters.desde) qs.append("desde", filters.desde);
  if (filters.hasta) qs.append("hasta", filters.hasta);
  if (filters.limite) qs.append("limite", filters.limite.toString());

  const queryString = qs.toString();
  return queryString ? `?${queryString}` : "";
};

export const getSolicitudRequest = (filters?: GetSolicitudesInput) => {
  const query = buildSolicitudesQuery(filters);
  return axios.get(`/solicitudes${query}`);
};

export const createSolicitudRequest = (solicitud: createSolicitud) => {
  return axios.post("/solicitudes", solicitud);
};

export const cancelarSolicitudRequest = (id: string, motivo: string) => {
  return axios.post(`/solicitudes/${id}/cancel`, { motivo: motivo.trim() });
};
