import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/roles.middleware";
import { Rol } from "../../generated/prisma/enums";
import { RutaController } from "./ruta.controller";

const router = Router();
router.use(authenticate);

router.get("/", RutaController.findAll);
router.get("/:id", RutaController.findById);
router.post(
  "/",
  requireRole(Rol.ADMINISTRADOR, Rol.SUPERVISOR),
  RutaController.create,
);
router.put(
  "/:id",
  requireRole(Rol.ADMINISTRADOR, Rol.SUPERVISOR),
  RutaController.update,
);
router.delete(
  "/:id",
  requireRole(Rol.ADMINISTRADOR),
  RutaController.softDelete,
);

export const rutaRoutes = router;
