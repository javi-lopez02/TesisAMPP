import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/roles.middleware";
import { Rol } from "../../generated/prisma/enums";
import { CircunscripcionController } from "./circunscripcion.controller";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas públicas para lectura (todos los roles autenticados)
router.get("/", CircunscripcionController.findAll);
router.get("/:id", CircunscripcionController.findById);
router.get(
  "/consejo/:consejoPopularId",
  CircunscripcionController.findByConsejoPopular,
);

// Rutas de escritura: solo ADMINISTRADOR o SUPERVISOR
router.post(
  "/",
  requireRole(Rol.ADMINISTRADOR, Rol.SUPERVISOR),
  CircunscripcionController.create,
);
router.put(
  "/:id",
  requireRole(Rol.ADMINISTRADOR, Rol.SUPERVISOR),
  CircunscripcionController.update,
);
router.delete(
  "/:id",
  requireRole(Rol.ADMINISTRADOR),
  CircunscripcionController.softDelete,
);

export const circunscripcionRoutes = router;
