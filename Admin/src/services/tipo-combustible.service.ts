import type { createTipoCombustible, updateTipoCombustible } from "../types/tipo-combustible.types";
import axios from "./axios.service";

export const createTipoCombustibleRequest = (combustible: createTipoCombustible) => {
  return axios.post(`/tipo-combustible`, combustible);
};

export const updateTipoCombustibleRequest = (combustible: updateTipoCombustible, id: string) => {
  return axios.put(`/tipo-combustible/${id}`, combustible);
};

export const getTipoCombustibleRequest = () => {
  return axios.get(`/tipo-combustible`);
};

export const deleteTipoCombustibleRequest = (id: string) => {
  return axios.delete(`/tipo-combustible/${id}`);
};
