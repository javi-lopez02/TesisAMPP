import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { ConsejoPopularController } from "./consejo-popular.controller";

const router = Router();

// router.use(authenticate);

router.get("/", ConsejoPopularController.findAll);
router.get("/:id", ConsejoPopularController.findById);
router.post("/", ConsejoPopularController.create);
router.put("/:id", ConsejoPopularController.update);
router.delete("/:id", ConsejoPopularController.softDelete);


export const consejoPopularRoutes = router;
