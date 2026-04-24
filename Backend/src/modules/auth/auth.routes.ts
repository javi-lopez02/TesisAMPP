import { Router } from "express";
import { AuthController } from "./auth.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

// Rutas públicas
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/refresh", AuthController.refreshToken);

// Rutas protegidas
router.get("/me", authenticate, AuthController.me);
router.post("/logout", authenticate, AuthController.logout);

export const authRoutes = router;
