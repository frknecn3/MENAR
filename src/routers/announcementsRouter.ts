import { Router, type RequestHandler } from "express";
import type { Router as ExpressRouter } from "express";
import { getAllAnnouncements, getAnnouncement } from "../controllers/announcementsController";

const router: ExpressRouter = Router();

router.get("/", getAllAnnouncements);

router.get("/:id", getAnnouncement);

export default router;