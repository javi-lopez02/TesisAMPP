import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/roles.middleware";
import { Rol } from "../../generated/prisma/enums";
import { ZonaController } from "./zona.controller";

const router = Router();
router.use(authenticate);

router.get("/", ZonaController.findAll);
router.get("/:id", ZonaController.findById);
router.post(
  "/",
  requireRole(Rol.ADMINISTRADOR, Rol.SUPERVISOR),
  ZonaController.create,
);
router.put(
  "/:id",
  requireRole(Rol.ADMINISTRADOR, Rol.SUPERVISOR),
  ZonaController.update,
);
router.delete(
  "/:id",
  requireRole(Rol.ADMINISTRADOR),
  ZonaController.softDelete,
);

export const zonaRoutes = router;
