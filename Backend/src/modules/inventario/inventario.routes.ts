import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/roles.middleware";
import { Rol } from "../../generated/prisma/enums";
import { InventarioController } from "./inventario.controller";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Lectura: ADMINISTRADOR, SUPERVISOR, DELEGADO pueden consultar inventarios
router.get("/", InventarioController.findAll);
router.get("/:id", InventarioController.findById);
router.get(
  "/:inventarioId/historial",
  InventarioController.historialMovimientos,
);

// Escritura: Solo ADMINISTRADOR o SUPERVISOR pueden crear/actualizar inventarios base
router.post(
  "/",
  requireRole(Rol.ADMINISTRADOR, Rol.SUPERVISOR),
  InventarioController.create,
);
router.put(
  "/:id",
  requireRole(Rol.ADMINISTRADOR, Rol.SUPERVISOR),
  InventarioController.update,
);

// Operación crítica de saldo: requiere rol elevado + autenticación
router.patch(
  "/:inventarioId/saldo",
  requireRole(Rol.ADMINISTRADOR, Rol.SUPERVISOR),
  InventarioController.ajustarSaldo,
);

export const inventarioRoutes = router;
