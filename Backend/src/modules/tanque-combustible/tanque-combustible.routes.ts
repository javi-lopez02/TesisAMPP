import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/roles.middleware";
import { Rol } from "../../generated/prisma";
import { TanqueCombustibleController } from "./tanque-combustible.controller";

const router = Router();
router.use(authenticate);

router.get("/", TanqueCombustibleController.findAll);
router.get("/:id", TanqueCombustibleController.findById);
router.post("/", requireRole(Rol.ADMINISTRADOR, Rol.SUPERVISOR), TanqueCombustibleController.create);
router.put("/:id", requireRole(Rol.ADMINISTRADOR, Rol.SUPERVISOR), TanqueCombustibleController.update);
router.delete("/:id", requireRole(Rol.ADMINISTRADOR), TanqueCombustibleController.softDelete);
router.get("/tipo/:tipoCombustibleId", TanqueCombustibleController.findByTipo);

export const tanqueCombustibleRoutes = router;