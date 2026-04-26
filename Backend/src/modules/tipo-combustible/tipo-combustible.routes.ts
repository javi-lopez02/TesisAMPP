import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/roles.middleware";
import { Rol } from "../../generated/prisma";
import { TipoCombustibleController } from "./tipo-combustible.controller";

const router = Router();
router.use(authenticate);

// Solo ADMINISTRADOR puede crear/eliminar tipos de combustible
router.get("/", TipoCombustibleController.findAll);
router.get("/:id", TipoCombustibleController.findById);
router.post("/", requireRole(Rol.ADMINISTRADOR), TipoCombustibleController.create);
router.put("/:id", requireRole(Rol.ADMINISTRADOR), TipoCombustibleController.update);
router.delete("/:id", requireRole(Rol.ADMINISTRADOR), TipoCombustibleController.softDelete);

export const tipoCombustibleRoutes = router;