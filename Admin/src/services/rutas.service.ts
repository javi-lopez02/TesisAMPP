import axios from "./axios.service";

export const getRutasRequest = () => {
  return axios.get(`/rutas`);
};
