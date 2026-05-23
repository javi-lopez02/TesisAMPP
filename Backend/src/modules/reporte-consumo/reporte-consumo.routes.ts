import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/roles.middleware";
import { Rol } from "../../generated/prisma/enums";
import { ReporteConsumoController } from "./reporte-consumo.controller";

const router = Router();
router.use(authenticate);

// Lectura: roles operativos pueden consultar reportes
router.get("/", ReporteConsumoController.findAll);
router.get("/:id", ReporteConsumoController.findById);
router.get(
  "/vehiculo/:vehiculoId/kpis",
  ReporteConsumoController.getKpisByVehiculo,
);

// Escritura: solo SUPERVISOR o ADMINISTRADOR pueden crear/editar reportes
router.post(
  "/",
  requireRole(Rol.SUPERVISOR, Rol.ADMINISTRADOR, Rol.CHOFER),
  ReporteConsumoController.create,
);
router.put(
  "/:id",
  requireRole(Rol.SUPERVISOR, Rol.ADMINISTRADOR, Rol.CHOFER),
  ReporteConsumoController.update,
);

// ⚠️ No hay DELETE: los reportes son inmutables por diseño contable

export const reporteConsumoRoutes = router;
