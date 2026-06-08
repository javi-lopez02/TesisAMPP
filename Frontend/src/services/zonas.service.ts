import axios from "./axios.service";

export const getZonaRequest = () => {
  return axios.get(`/zonas`);
};
