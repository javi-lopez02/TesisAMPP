import type { GetMovimientosParams } from "../hooks/useMovimientoCombustible";
import type { createMovimiento } from "../types/movimiento.types";
import axios from "./axios.service";

export const createMovimientoCombustibleRequest = (
  movimiento: createMovimiento,
) => {
  return axios.post(`/movimiento-combustible`, movimiento);
};

export const getMovimientosRequest = (params?: GetMovimientosParams) => {
  const qs = new URLSearchParams();
  if (params?.inventarioId) qs.append("inventarioId", params.inventarioId);
  if (params?.asambleaId) qs.append("asambleaId", params.asambleaId);
  if (params?.tipoCombustibleId)
    qs.append("tipoCombustibleId", params.tipoCombustibleId);
  if (params?.desde) qs.append("desde", params.desde);
  if (params?.hasta) qs.append("hasta", params.hasta);
  if (params?.limite) qs.append("limite", params.limite.toString());

  return axios.get(`/movimiento-combustible${qs.toString() ? `?${qs}` : ""}`);
};
