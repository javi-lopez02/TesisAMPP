import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/roles.middleware";
import { Rol } from "../../generated/prisma/enums";
import { UsuarioController } from "./usuario.controller";

const router = Router();
router.use(authenticate);

// CRUD: Solo ADMIN y SUPERVISOR pueden gestionar usuarios
router.get(
  "/",
  requireRole(Rol.ADMINISTRADOR, Rol.SUPERVISOR),
  UsuarioController.findAll,
);
router.get(
  "/:id",
  requireRole(Rol.ADMINISTRADOR, Rol.SUPERVISOR),
  UsuarioController.findById,
);
router.post("/", requireRole(Rol.ADMINISTRADOR), UsuarioController.create);
router.put("/:id", requireRole(Rol.ADMINISTRADOR), UsuarioController.update);
router.delete(
  "/:id",
  requireRole(Rol.ADMINISTRADOR),
  UsuarioController.softDelete,
);

export const usuarioRoutes = router;
