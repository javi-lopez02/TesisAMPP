import axios from "./axios.service";

export const getConsejoRequest = () => {
  return axios.get(`/consejo-popular`);
};

