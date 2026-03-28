import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { getStockData } from "../controllers/stocksController";

const router: ExpressRouter = Router();

router.get("/:id", getStockData);

export default router;
