import axios from "./axios.service";

export const getCircunscripcionRequest = () => {
  return axios.get(`/circunscripcion`);
};