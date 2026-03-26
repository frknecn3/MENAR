import { Router, type RequestHandler } from "express";
import { getAllAnnouncements, getAnnouncement } from "../controllers/announcementsController";

const router = Router();

router.get("/", getAllAnnouncements);

router.get("/:id", getAnnouncement);

export default router;