import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { authLimiter } from "../middleware/rateLimiters";
import { registerSchema, loginSchema } from "../utils/zodSchemas";

const router = Router();

router.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  AuthController.register,
);
router.post("/login", authLimiter, validate(loginSchema), AuthController.login);

export default router;
