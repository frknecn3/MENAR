import type { RequestHandler } from "express";
import type { Request, Response } from 'express'
import { c } from "../helpers/catchAsync";
import api from "../api/axios";
import { AppResponse } from "../helpers/response";
import { parseKapHtmlToMarkdown } from "../helpers/cleanHTML";
import { analyzeKapNotification } from "../llm/analystService";

export const getAllAnnouncements: RequestHandler = c(async (req: Request, res: Response) => {
    console.log("announcements trigger")
    const response = await api.post('api/disclosure/list/main', {
        fromDate: "16.03.2026",
        memberTypes: ["IGS", "DDK"],
        toDate: "16.03.2026"
    });

    console.log("Cevap: ", response.data)

    return AppResponse(res, 'Duyurular başarıyla getirildi.', response.data)
})

export const getAnnouncement: RequestHandler = c(async (req: Request, res: Response) => {
    const response = await api.get(`Bildirim/${req.params.id}`)

    const parsed = parseKapHtmlToMarkdown(response.data)

    console.log(parsed)
    
    const analysis = await analyzeKapNotification(parsed);

    return AppResponse(res, 'Duyuru başarıyla analiz edildi.', analysis)
})