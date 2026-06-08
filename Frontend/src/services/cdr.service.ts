import axios from "./axios.service";

export const getCdrRequest = () => {
  return axios.get(`/cdr`);
};
