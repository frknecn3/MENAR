import { Router, type RequestHandler } from "express";
import { getAllAnnouncements } from "../controllers/announcementsController";

const router = Router();

router.get("/", getAllAnnouncements);

export default router;