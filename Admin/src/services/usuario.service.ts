import axios from "./axios.service";
import type { createUsuario, updateUsuario } from "../types/usuarios.types";

export const getUsuariosRequest = (filters?: {
  rol?: string;
  activo?: boolean;
  busqueda?: string;
}) => {
  return axios.get("/usuario", { params: filters });
};

export const getUsuarioByIdRequest = (id: string) => {
  return axios.get(`/usuario/${id}`);
};

export const createUsuarioRequest = (usuario: createUsuario) => {
  return axios.post("/usuario", usuario);
};

export const updateUsuarioRequest = (usuario: updateUsuario, id: string) => {
  return axios.put(`/usuario/${id}`, usuario);
};

export const deleteUsuarioRequest = (id: string) => {
  return axios.delete(`/usuario/${id}`);
};
