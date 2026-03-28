import { Router, type RequestHandler } from "express";
import { getStockData } from "../controllers/stocksController";


const router = Router();

// router.get("/", getStocks);

router.get("/:id", getStockData);

export default router;