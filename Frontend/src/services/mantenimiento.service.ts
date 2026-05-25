import axios from "./axios.service";
import type {
  createMantenimiento,
  updateMantenimiento,
} from "../types/mantenimiento.types";

export type GetMantenimientosParams = {
  vehiculoId?: string;
  tipo?: "Preventivo" | "Correctivo";
  desde?: string;
  hasta?: string;
  limite?: number;
};

export const createMantenimientoRequest = (
  mantenimiento: createMantenimiento,
) => axios.post("/mantenimiento", mantenimiento);

export const updateMantenimientoRequest = (
  mantenimiento: updateMantenimiento,
  id: string,
) => axios.patch(`/mantenimiento/${id}`, mantenimiento);

export const getMantenimientosRequest = (params?: GetMantenimientosParams) => {
  const qs = new URLSearchParams();
  if (params?.vehiculoId) qs.append("vehiculoId", params.vehiculoId);
  if (params?.tipo) qs.append("tipo", params.tipo);
  if (params?.desde) qs.append("desde", params.desde);
  if (params?.hasta) qs.append("hasta", params.hasta);
  if (params?.limite) qs.append("limite", params.limite.toString());
  return axios.get(`/mantenimiento${qs.toString() ? `?${qs}` : ""}`);
};
