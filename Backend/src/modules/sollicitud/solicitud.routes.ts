import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/roles.middleware";
import { Rol } from "../../generated/prisma/enums";
import { SolicitudController } from "./solicitud.controller";

const router = Router();
router.use(authenticate);

// 🔹 Lectura: todos los roles autenticados pueden consultar
router.get("/", SolicitudController.findAll);
router.get("/:id", SolicitudController.findById);

// 🔹 Crear: DELEGADO, PRESIDENTE_CONSEJO, SUPERVISOR pueden solicitar
router.post(
  "/",
  requireRole(
    Rol.DELEGADO,
    Rol.PRESIDENTE_CONSEJO,
    Rol.SUPERVISOR,
    Rol.ADMINISTRADOR,
  ),
  SolicitudController.create,
);

// 🔹 Transiciones de estado: solo roles de aprobación
router.post(
  "/:id/approve",
  requireRole(Rol.ADMINISTRADOR, Rol.SUPERVISOR),
  SolicitudController.approve,
);
router.post(
  "/:id/reject",
  requireRole(Rol.ADMINISTRADOR, Rol.SUPERVISOR),
  SolicitudController.reject,
);

// 🔹 Cancelar: solo el propietario de la solicitud
router.post("/:id/cancel", SolicitudController.cancel);

export const solicitudRoutes = router;
