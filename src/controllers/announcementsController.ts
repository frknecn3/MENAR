import type { Request, Response, RequestHandler } from "express";
import { c } from "../helpers/catchAsync";
import api from "../api/axios";
import { AppResponse } from "../helpers/response";
import { parseKapHtmlToMarkdown } from "../helpers/cleanHTML";
import {
    analyzeKapNotification,
    type KapAnalysis,
} from "../llm/analystService";

// Basit in-memory cache (kalıcılık istersen SQLite/Postgres'e taşı)
const analysisCache = new Map<string, KapAnalysis>();

// KAP'ın beklediği gg.aa.yyyy formatında bugünün tarihi
const todayKapFormat = (): string => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
};

export const getAllAnnouncements: RequestHandler = c(
    async (req: Request, res: Response) => {
        const fromDate = (req.query.fromDate as string) ?? todayKapFormat();
        const toDate = (req.query.toDate as string) ?? todayKapFormat();

        console.log("announcements trigger", { fromDate, toDate });

        const response = await api.post("api/disclosure/list/main", {
            fromDate,
            toDate,
            memberTypes: ["IGS", "DDK"],
        });

        return AppResponse(res, "Duyurular başarıyla getirildi.", response.data);
    }
);

export const getAnnouncement: RequestHandler = c(
    async (req: Request, res: Response) => {
        let { id } = req.params;

        id = String(id);

        // 1) Önbellek kontrolü — aynı bildirimi tekrar analiz etme
        const cached = analysisCache.get(id);
        if (cached) {
            return AppResponse(res, "Duyuru önbellekten getirildi.", {
                ...cached,
                cached: true,
            });
        }

        // 2) Bildirimi çek + HTML'i markdown'a çevir
        const { data } = await api.get(`Bildirim/${id}`);

        console.log("RAW TYPE:", typeof data);
        console.log("RAW PREVIEW:", JSON.stringify(data).slice(0, 500));

        const parsed = parseKapHtmlToMarkdown(data);

        console.log("PARSED LENGTH:", parsed?.length);
        console.log("PARSED PREVIEW:", parsed?.slice(0, 300));

        // 3) LLM ile analiz et
        const analysis = await analyzeKapNotification(parsed);

        // 4) Önbelleğe yaz
        analysisCache.set(id, analysis);

        return AppResponse(res, "Duyuru başarıyla analiz edildi.", {
            ...analysis,
            cached: false,
        });
    }
);