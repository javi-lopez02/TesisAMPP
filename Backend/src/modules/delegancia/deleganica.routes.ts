import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { DelegaciaController } from "./delegancia.controller";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas CRUD estándar
router.get("/", DelegaciaController.findAll);
router.get("/:id", DelegaciaController.findById);
router.post("/", DelegaciaController.create);
router.put("/:id", DelegaciaController.update);
router.delete("/:id", DelegaciaController.softDelete);

// Ruta adicional: delegacias por consejo popular
router.get(
  "/consejo/:consejoPopularId",
  DelegaciaController.findByConsejoPopular,
);

export const delegaciaRoutes = router;
