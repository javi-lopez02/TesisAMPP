import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/roles.middleware";
import { Rol } from "../../generated/prisma/enums";
import { SolicitudController } from "./solicitud.controller";

const router = Router();
router.use(authenticate);

// ── RUTAS PÚBLICAS (para todos los autenticados) ────────────────
router.get("/", SolicitudController.findAll);
router.get("/:id", SolicitudController.findById);
router.get("/:id/transiciones", SolicitudController.getTransitions);
router.get("/usuario/:usuarioId", SolicitudController.getByUsuario);

// ── CREAR: cualquier rol autenticado puede solicitar ───────────
router.post("/", SolicitudController.create);

// ── APROBAR/RECHAZAR: solo ADMIN o SUPERVISOR ─────────────────
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

// ── CANCELAR: creador o ADMIN ─────────────────────────────────
router.post("/:id/cancel", SolicitudController.cancel);


export const solicitudRoutes = router;
