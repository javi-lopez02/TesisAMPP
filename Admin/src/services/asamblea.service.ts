import type { createAsamblea, updateAsamblea } from "../types/asamblea.types";
import axios from "./axios.service";

export const createAsambleaRequest = (asamblea: createAsamblea) => {
  return axios.post(`/asamblea`, asamblea);
};

export const updateAsambleaRequest = (asamblea: updateAsamblea, id: string) => {
  return axios.put(`/asamblea/${id}`, asamblea);
};

export const getAsambleaRequest = () => {
  return axios.get(`/asamblea`);
};

export const deleteAsambleaRequest = (id: string) => {
  return axios.delete(`/asamblea/${id}`);
};
