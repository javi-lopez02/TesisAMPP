import axios from "./axios.service";

export const getTipoCombustibleRequest = () => {
  return axios.get(`/tipo-combustible`);
};