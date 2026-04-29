import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/roles.middleware";
import { Rol } from "../../generated/prisma/enums";
import { AsambleaController } from "./ampp.controller";

const router = Router();
router.use(authenticate);

router.get("/", AsambleaController.findAll);
router.get("/:id", AsambleaController.findById);
router.post("/", requireRole(Rol.ADMINISTRADOR), AsambleaController.create);
router.put("/:id", requireRole(Rol.ADMINISTRADOR), AsambleaController.update);
router.delete(
  "/:id",
  requireRole(Rol.ADMINISTRADOR),
  AsambleaController.softDelete,
);

export const asambleaRoutes = router;
