import type { createZona, updateZona } from "../types/zonas.types";
import axios from "./axios.service";

export const createZonaRequest = (zona: createZona) => {
  return axios.post(`/zonas`, zona);
};

export const updateZonaRequest = (zona: updateZona, id: string) => {
  return axios.put(`/zonas/${id}`, zona);
};

export const getZonaRequest = () => {
  return axios.get(`/zonas`);
};

export const deleteZonaRequest = (id: string) => {
  return axios.delete(`/zonas/${id}`);
};
