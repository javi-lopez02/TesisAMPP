import type {
  createReporte,
  updateReporte,
} from "../types/reporte-consumo.types";
import axios from "./axios.service";

export const createReporteConsumoRequest = (reporte: createReporte) => {
  return axios.post(`/reporte-consumo`, reporte);
};

export const updateReporteConsumoRequest = (
  reporte: updateReporte,
  id: string,
) => {
  return axios.post(`/reporte-consumo/${id}`, reporte);
};

export const getReporteConsumoRequest = () => {
  return axios.get(`/reporte-consumo`);
};
