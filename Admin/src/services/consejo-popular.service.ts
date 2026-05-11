import type { createConsejo, updateConsejo } from "../types/consejo.types";
import axios from "./axios.service";

export const createConsejoRequest = (consejo: createConsejo) => {
  return axios.post(`/consejo-popular`, consejo);
};

export const updateConsejoRequest = (consejo: updateConsejo, id: string) => {
  return axios.put(`/consejo-popular/${id}`, consejo);
};

export const getConsejoRequest = () => {
  return axios.get(`/consejo-popular`);
};

export const deleteConsejoRequest = (id: string) => {
  return axios.delete(`/consejo-popular/${id}`);
};

