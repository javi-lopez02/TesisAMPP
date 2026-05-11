import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { ConsejoPopularController } from "./consejo-popular.controller";
import { requireRole } from "../../middlewares/roles.middleware";
import { Rol } from "../../generated/prisma/enums";

const router = Router();

router.use(authenticate);

router.get("/", ConsejoPopularController.findAll);
router.get("/:id", ConsejoPopularController.findById);
router.post("/", requireRole(Rol.ADMINISTRADOR, Rol.SUPERVISOR), ConsejoPopularController.create);
router.put("/:id", requireRole(Rol.ADMINISTRADOR, Rol.SUPERVISOR), ConsejoPopularController.update);
router.delete("/:id", requireRole(Rol.ADMINISTRADOR), ConsejoPopularController.softDelete);


export const consejoPopularRoutes = router;
