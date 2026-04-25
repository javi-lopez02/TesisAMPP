import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import { loginSchema, registerSchema } from "./auth.dto";
import { generateTokens, JwtPayload } from "../../utils/jwt";

export const AuthController = {
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = registerSchema.parse(req.body);
      const result = await AuthService.register(data);

      console.log(result.usuario);

      // Generar tokens
      const jwtPayload: JwtPayload = {
        sub: result.usuario.id,
        correo: result.usuario.correo,
        rol: result.usuario.rol,
      };

      const tokens = generateTokens(jwtPayload);

      res.cookie("accessToken", tokens.accessToken, {
        httpOnly: false,
        secure: true,
        sameSite: "none",
      });

      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: false,
        secure: true,
        sameSite: "none",
      });

      res.status(201).json({
        success: true,
        message: "Usuario registrado exitosamente",
        data: result.usuario,
      });
    } catch (error) {
      next(error);
    }
  },

  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const credentials = loginSchema.parse(req.body);
      const result = await AuthService.login(credentials);

      // Generar tokens
      const jwtPayload: JwtPayload = {
        sub: result.usuario.id,
        correo: result.usuario.correo,
        rol: result.usuario.rol,
      };

      const tokens = generateTokens(jwtPayload);

      res.cookie("accessToken", tokens.accessToken, {
        httpOnly: false,
        secure: true,
        sameSite: "none",
      });

      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: false,
        secure: true,
        sameSite: "none",
      });

      res.json({
        success: true,
        message: "Login exitoso",
        data: result.usuario,
      });
    } catch (error) {
      next(error);
    }
  },

  refreshToken: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies.refreshToken; // ← Leer de cookies
      if (!refreshToken) {
        return res
          .status(401)
          .json({ success: false, error: "Refresh token requerido" });
      }

      const { accessToken, refreshToken: newRefreshToken } =
        await AuthService.refreshToken(refreshToken);

      // ← Actualizar cookies
      res.cookie("accessToken", accessToken, {
        ...{
          httpOnly: false,
          secure: true,
          sameSite: "none",
        },
        maxAge: 15 * 60 * 1000,
      });

      res.cookie("refreshToken", newRefreshToken, {
        ...{
          httpOnly: false,
          secure: true,
          sameSite: "none",
        },
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({ success: true, message: "Tokens renovados" });
    } catch (error) {
      next(error);
    }
  },

  logout: async (req: Request, res: Response) => {
    // Limpiar cookies
    try {
      res.clearCookie("accessToken", {
        httpOnly: false,
        secure: true,
        sameSite: "none",
      });
      res.clearCookie("refreshToken", {
        httpOnly: false,
        secure: true,
        sameSite: "none",
      });

      res.json({ success: true, message: "Sesión cerrada" });
    } catch (error) {
    }
  },

  me: async (req: Request, res: Response) => {
    // req.usuario es inyectado por el middleware de auth
    res.json({ success: true, data: req.usuario });
  },
};
