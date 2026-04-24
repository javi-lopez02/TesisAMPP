import jwt from "jsonwebtoken";
import { Rol } from "../generated/prisma";

export interface JwtPayload {
  sub: string; // ID del usuario
  correo: string;
  rol: Rol;
  iat?: number;
  exp?: number;
}

export const generateTokens = (payload: JwtPayload) => {
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "1h",
  });
  const refreshToken = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

export const verifyToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  } catch {
    return null;
  }
};
