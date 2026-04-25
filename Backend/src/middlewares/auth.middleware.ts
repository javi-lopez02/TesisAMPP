import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "../utils/jwt";
import { prisma } from "../config/prisma";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const accessToken = req.cookies?.accessToken;

    if (!accessToken) {
      return res.status(401).json(["No token, authorization denied"]);
    }
    const payload = verifyToken(accessToken);

    if (!payload) {
      return res.status(401).json({ error: "Token inválido o expirado" });
    }

    // Verificar que el usuario existe y está activo
    const usuario = await prisma.usuario.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        nombre: true,
        apellidos: true,
        correo: true,
        rol: true,
        delegaciaId: true,
        activo: true,
      },
    });

    if (!usuario || !usuario.activo) {
      return res
        .status(401)
        .json({ error: "Usuario no encontrado o inactivo" });
    }

    // Inyectar usuario en la request
    req.usuario = {
      id: usuario.id,
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      correo: usuario.correo,
      activo: usuario.activo,
      rol: usuario.rol,
      delegaciaId: usuario.delegaciaId ?? undefined,
    };

    next();
  } catch (error) {
    res.status(500).json({ error: "Error de autenticación" });
  }
};
