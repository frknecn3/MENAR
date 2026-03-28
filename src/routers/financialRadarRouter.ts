import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { fetchFinancialRadarBist100WeeklyData } from "../controllers/financialRadarController";

const router: ExpressRouter = Router();

router.get("/bist100-weekly", fetchFinancialRadarBist100WeeklyData);

export default router;
