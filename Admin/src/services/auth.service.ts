import axios from "./axios.service";

interface userLogin {
  correo: string;
  contrasenia: string;
}

export const LoginRequest = (user: userLogin) => {
  return axios.post(`/auth/login`, user);
};

export const LogoutRequest = () => {
  return axios.post(`/auth/logout`);
};

export const me = () => {
  return axios.get(`/auth/me`);
};
