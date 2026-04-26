import express from "express";
import { Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import * as dotenv from "dotenv";
import path from "path";

import { authRoutes } from "./modules/auth/auth.routes.js";
import { consejoPopularRoutes } from "./modules/consejo-popular/consejo-popular.routes.js";
import { delegaciaRoutes } from "./modules/delegancia/deleganica.routes.js";
import { vehiculoRoutes } from "./modules/vehiculo/vehiculo.routes.js";
import { tipoCombustibleRoutes } from "./modules/tipo-combustible/tipo-combustible.routes.js";
import { tanqueCombustibleRoutes } from "./modules/tanque-combustible/tanque-combustible.routes.js";
import { movimientoTanqueRoutes } from "./modules/movimiento-tanque/movimiento-tanque.routes.js";
import { mantenimientoRoutes } from "./modules/mantenimiento/mantenimiento.routes.js";

dotenv.config();
const port = 4000;
const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:4173",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:8000",
      "http://192.168.12.1:5173",
    ],
    credentials: true,
  }),
);

app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

app.use("/public", express.static(path.join(__dirname, "/Upload")));

app.use("/api/auth", authRoutes);
app.use("/api/consejos-populares", consejoPopularRoutes);
app.use("/api/vehiculos", vehiculoRoutes);
app.use("/api/delegacias", delegaciaRoutes);
app.use("/api/tipos-combustible", tipoCombustibleRoutes);
app.use("/api/tanques", tanqueCombustibleRoutes);
app.use("/api/movimientos-tanque", movimientoTanqueRoutes);
app.use("/api/mantenimientos", mantenimientoRoutes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("🔴 Error:", err);

  // Zod Validation Errors
  if (err.name === "ZodError") {
    const zodErr = err as import("zod").ZodError;
    return res.status(400).json({
      success: false,
      error: "Validación fallida",
      details: zodErr.issues,
    });
  }

  // Errores de negocio personalizados
  if ((err as any).isBusinessError) {
    return res.status(400).json({ success: false, error: err.message });
  }

  // Errores de Prisma
  if (err.name === "PrismaClientKnownRequestError") {
    const prismaErr = err as any;
    const messages: Record<string, string> = {
      P2002: "Registro duplicado",
      P2025: "Registro no encontrado",
      P2003: "Error de clave foránea",
    };
    return res.status(409).json({
      success: false,
      error: messages[prismaErr.code] || "Error de base de datos",
      code: prismaErr.code,
    });
  }

  // Fallback: Error 500
  res.status(500).json({
    success: false,
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Error interno del servidor",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

app.listen(port, () => {
  console.log(`Server on port ${port}`);
});
