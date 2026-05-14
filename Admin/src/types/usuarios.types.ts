export type RolUsuario =
  | "DELEGADO"
  | "SUPERVISOR"
  | "PRESIDENTE_CONSEJO"
  | "CHOFER"
  | "ADMINISTRADOR";

export interface getUsuario {
  id: string;
  correo: string;
  nombre: string;
  apellidos: string;
  rol:
    | "DELEGADO"
    | "SUPERVISOR"
    | "PRESIDENTE_CONSEJO"
    | "CHOFER"
    | "ADMINISTRADOR";
  activo: boolean;
  createdAt: string;
  updatedAt?: string;
  consejoPopularPresidente?: { id: string; nombre: string } | null;
  circunscripcionDelegado?: { id: string; nombre: string } | null;
}

export interface createUsuario {
  correo: string;
  contrasenia: string;
  nombre: string;
  apellidos: string;
  rol:
    | "DELEGADO"
    | "SUPERVISOR"
    | "PRESIDENTE_CONSEJO"
    | "CHOFER"
    | "ADMINISTRADOR";
}

export interface updateUsuario {
  correo?: string;
  contrasenia?: string;
  nombre?: string;
  apellidos?: string;
  rol?:
    | "DELEGADO"
    | "SUPERVISOR"
    | "PRESIDENTE_CONSEJO"
    | "CHOFER"
    | "ADMINISTRADOR";
  activo?: boolean;
}

export interface FormState {
  correo: string;
  contrasenia: string;
  nombre: string;
  apellidos: string;
  rol:
    | "DELEGADO"
    | "SUPERVISOR"
    | "PRESIDENTE_CONSEJO"
    | "CHOFER"
    | "ADMINISTRADOR";
  activo: boolean;
}
