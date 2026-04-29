import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/roles.middleware";
import { Rol } from "../../generated/prisma/enums";
import { CDRController } from "./cdr.controller";

const router = Router();
router.use(authenticate);

router.get("/", CDRController.findAll);
router.get("/:id", CDRController.findById);
router.post(
  "/",
  requireRole(Rol.ADMINISTRADOR, Rol.SUPERVISOR),
  CDRController.create,
);
router.put(
  "/:id",
  requireRole(Rol.ADMINISTRADOR, Rol.SUPERVISOR),
  CDRController.update,
);
router.delete("/:id", requireRole(Rol.ADMINISTRADOR), CDRController.softDelete);

export const cdrRoutes = router;
