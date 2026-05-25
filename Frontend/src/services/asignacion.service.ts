// src/services/asignacion.service.ts
import axios from "./axios.service";
import type { GetAsignacionesParams } from "../types/asignacion.types";

const buildAsignacionesQuery = (params?: GetAsignacionesParams): string => {
  if (!params) return "";

  const qs = new URLSearchParams();

  // ✅ Solo los campos de tu schema de Zod:
  if (params.estado) qs.append("estado", params.estado);
  if (params.vehiculoId) qs.append("vehiculoId", params.vehiculoId);
  if (params.responsableId) qs.append("responsableId", params.responsableId);
  if (params.solicitudId) qs.append("solicitudId", params.solicitudId);
  if (params.desde) qs.append("desde", params.desde); // ISO string: YYYY-MM-DD
  if (params.hasta) qs.append("hasta", params.hasta); // ISO string: YYYY-MM-DD

  const queryString = qs.toString();
  return queryString ? `?${queryString}` : "";
};

export const getAsignacionesRequest = (params?: GetAsignacionesParams) => {
  const query = buildAsignacionesQuery(params);
  return axios.get(`/asignaciones${query}`);
};

export const getAsignacionByIdRequest = (id: string) => {
  return axios.get(`/asignaciones/${id}`);
};
