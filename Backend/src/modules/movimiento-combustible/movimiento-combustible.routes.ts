import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/roles.middleware";
import { Rol } from "../../generated/prisma/enums";
import { MovimientoCombustibleController } from "./movimiento-combustible.controller";

const router = Router();
router.use(authenticate);

router.get("/", MovimientoCombustibleController.findAll);
router.get("/:id", MovimientoCombustibleController.findById);
router.post(
  "/",
  requireRole(Rol.ADMINISTRADOR, Rol.SUPERVISOR),
  MovimientoCombustibleController.create,
);

export const movimientoCombustibleRoutes = router;
