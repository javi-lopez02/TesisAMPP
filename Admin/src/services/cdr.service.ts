import type { createCdr, updateCdr } from "../types/cdrs.types";
import axios from "./axios.service";

export const createCdrRequest = (cdr: createCdr) => {
  return axios.post(`/cdr`, cdr);
};

export const updateCdrRequest = (cdr: updateCdr, id: string) => {
  return axios.put(`/cdr/${id}`, cdr);
};

export const getCdrRequest = () => {
  return axios.get(`/cdr`);
};

export const deleteCdrRequest = (id: string) => {
  return axios.delete(`/cdr/${id}`);
};
