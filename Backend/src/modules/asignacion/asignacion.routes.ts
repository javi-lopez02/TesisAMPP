import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { AsignacionController } from "./asignacion.controller";

const router = Router();
// Solo lectura: cualquier usuario autenticado puede consultar asignaciones
router.use(authenticate);

router.get("/", AsignacionController.findAll);
router.get("/:id", AsignacionController.findById);

export const asignacionRoutes = router;
