import type { RequestHandler } from "express";
import type { Request, Response } from 'express'
import { c } from "../helpers/catchAsync";
import api from "../api/axios";
import { AppResponse } from "../helpers/response";

export const getAllAnnouncements: RequestHandler = c(async (req: Request, res: Response) => {
    console.log("announcements trigger")
    const response = await api.post('disclosure/list/main', {
        fromDate: "16.03.2026",
        memberTypes: ["IGS", "DDK"],
        toDate: "16.03.2026"
    });

    console.log("Cevap: ", response.data)

    return AppResponse(res,'Duyurular başarıyla getirildi.', response.data)
})