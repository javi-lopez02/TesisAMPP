import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/roles.middleware";
import { Rol } from "../../generated/prisma";
import { MantenimientoController } from "./mantenimiento.controller";

const router = Router();
router.use(authenticate);

router.get("/", MantenimientoController.findAll);
router.get("/vehiculo/:vehiculoId", MantenimientoController.findByVehiculo);
router.get("/:id", MantenimientoController.findById);
router.post("/", requireRole(Rol.ADMINISTRADOR, Rol.SUPERVISOR, Rol.DELEGADO), MantenimientoController.create);
router.put("/:id", requireRole(Rol.ADMINISTRADOR, Rol.SUPERVISOR), MantenimientoController.update);
router.delete("/:id", requireRole(Rol.ADMINISTRADOR), MantenimientoController.softDelete);

export const mantenimientoRoutes = router;