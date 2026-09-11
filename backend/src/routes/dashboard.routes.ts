import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { DashboardController } from "../controllers/dashboard.controller";

const router = Router();

router.use(authenticate);
router.get("/stats", DashboardController.stats);
router.get("/overview", DashboardController.overview);
export default router;
