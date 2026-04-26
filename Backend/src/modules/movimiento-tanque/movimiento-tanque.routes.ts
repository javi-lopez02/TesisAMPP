import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/roles.middleware";
import { Rol } from "../../generated/prisma";
import { MovimientoTanqueController } from "./movimiento-tanque.controller";

const router = Router();
router.use(authenticate);

router.get("/", MovimientoTanqueController.findAll);
router.get("/:id", MovimientoTanqueController.findById);
router.post("/", requireRole(Rol.ADMINISTRADOR, Rol.SUPERVISOR, Rol.DELEGADO), MovimientoTanqueController.create);
router.put("/:id", requireRole(Rol.ADMINISTRADOR, Rol.SUPERVISOR), MovimientoTanqueController.update);
router.delete("/:id", requireRole(Rol.ADMINISTRADOR), MovimientoTanqueController.softDelete);
router.get("/tanque/:tanqueId", MovimientoTanqueController.findByTanque);

export const movimientoTanqueRoutes = router;