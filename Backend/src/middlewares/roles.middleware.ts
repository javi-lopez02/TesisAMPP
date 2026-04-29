import { Request, Response, NextFunction } from "express";
import { Rol } from "../generated/prisma/enums";

export const requireRole = (...roles: Rol[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.usuario) {
      return res.status(401).json({ error: "Autenticación requerida" });
    }

    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({
        error: "Acceso denegado",
        message: `Se requiere uno de los roles: ${roles.join(", ")}`,
      });
    }

    next();
  };
};

// Middleware helper para verificar pertenencia a delegacia
export const requireDelegaciaAccess = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { delegaciaId } = req.params;

  // ADMINISTRADOR tiene acceso global
  if (req.usuario?.rol === Rol.ADMINISTRADOR) {
    return next();
  }

  // Otros roles solo acceden a su delegacia
  if (req.usuario?.delegaciaId && req.usuario.delegaciaId === delegaciaId) {
    return next();
  }

  return res.status(403).json({ error: "Acceso denegado a esta delegacia" });
};
