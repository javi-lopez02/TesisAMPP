import { Rol } from "./generated/prisma";

// Extender Request para incluir usuario autenticado
declare global {
  namespace Express {
    interface Request {
      usuario?: {
        id: string;
        correo: string;
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