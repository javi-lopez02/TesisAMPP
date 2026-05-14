import { Rol } from "./generated/prisma/enums";

// Extender Request para incluir usuario autenticado
declare global {
  namespace Express {
    interface Request {
      usuario?: {
        id: string;
        nombre: string;
        apellidos: string;
        correo: string;
        activo: boolean;
        rol: Rol;
        delegaciaId?: string;
      };
      cookies: {
        accessToken?: string;
        refreshToken?: string;
      };
    }
  }
}