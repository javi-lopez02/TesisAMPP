import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/roles.middleware";
import { Rol } from "../../generated/prisma/enums";
import { PuntoRutaController } from "./punto-ruta.controller";

const router = Router();
router.use(authenticate);

router.get("/ruta/:rutaId", PuntoRutaController.findByRuta);
router.get("/:id", PuntoRutaController.findById);
router.post(
  "/",
  requireRole(Rol.ADMINISTRADOR, Rol.SUPERVISOR),
  PuntoRutaController.create,
);
router.put(
  "/:id",
  requireRole(Rol.ADMINISTRADOR, Rol.SUPERVISOR),
  PuntoRutaController.update,
);
router.delete(
  "/:id",
  requireRole(Rol.ADMINISTRADOR),
  PuntoRutaController.delete,
);

export const puntoRutaRoutes = router;
