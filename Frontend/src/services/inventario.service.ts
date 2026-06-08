import type {
  createInventario,
  GetMovimientosParams,
  updateInventario,
} from "../types/inventario.types";
import axios from "./axios.service";

export const createInventarioRequest = (inventario: createInventario) => {
  return axios.post(`/inventarios`, inventario);
};

export const updateInventarioRequest = (
  inventario: updateInventario,
  id: string,
) => {
  return axios.put(`/inventarios/${id}`, inventario);
};

export const getInventarioRequest = () => {
  return axios.get(`/inventarios`);
};

export const getInventarioMovimientosRequest = async (
  inventarioId: string,
  params?: GetMovimientosParams,
) => {
  // Construir query params
  const queryParams = new URLSearchParams();

  if (params?.desde) {
    const desdeDate =
      params.desde instanceof Date ? params.desde : new Date(params.desde);
    queryParams.append("desde", desdeDate.toISOString());
  }

  if (params?.hasta) {
    const hastaDate =
      params.hasta instanceof Date ? params.hasta : new Date(params.hasta);
    queryParams.append("hasta", hastaDate.toISOString());
  }

  if (params?.limite) {
    queryParams.append("limite", params.limite.toString());
  }

  const queryString = queryParams.toString();
  const url = `/inventario/${inventarioId}/movimientos${queryString ? `?${queryString}` : ""}`;

  return axios.get(url);
};
