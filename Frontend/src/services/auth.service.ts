import axios from "./axios.service";

interface userRegister {
  nombre: string;
  apellidos: string;
  correo: string;
  contrasenia: string;
  rol?:
    | "ADMINISTRADOR"
    | "DELEGADO"
    | "PRESIDENTE_CONSEJO"
    | "CHOFER"
    | "SUPERVISOR";
  delegancia?: string;
}

interface userLogin {
  correo: string;
  contrasenia: string;
}

export const RegisterRequest = (user: userRegister) => {
  return axios.post(`/auth/register`, user);
};

export const LoginRequest = (user: userLogin) => {
  return axios.post(`/auth/login`, user);
};

export const LogoutRequest = () => {
  return axios.post(`/auth/logout`);
};

export const me = () => {
  return axios.get(`/auth/me`);
};
