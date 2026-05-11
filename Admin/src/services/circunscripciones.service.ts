import type {
  createCircunscripcion,
  updateCircunscripcion,
} from "../types/circunscripcion.types";
import axios from "./axios.service";

export const createCircunscripcionRequest = (
  circunscripcion: createCircunscripcion,
) => {
  return axios.post(`/circunscripcion`, circunscripcion);
};

export const updateCircunscripcionRequest = (
  circunscripcion: updateCircunscripcion,
  id: string,
) => {
  return axios.put(`/circunscripcion/${id}`, circunscripcion);
};

export const getCircunscripcionRequest = () => {
  return axios.get(`/circunscripcion`);
};

export const deleteCircunscripcionRequest = (id: string) => {
  return axios.delete(`/circunscripcion/${id}`);
};
