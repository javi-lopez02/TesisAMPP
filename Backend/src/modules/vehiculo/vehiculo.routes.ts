import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { VehiculoController } from "./vehiculo.controller";

const router = Router();

router.use(authenticate);

router.get("/", VehiculoController.findAll);
router.get("/:id", VehiculoController.findById);
router.post("/", VehiculoController.create);
router.put("/:id", VehiculoController.update);
router.delete("/:id", VehiculoController.softDelete);

export const vehiculoRoutes = router;
