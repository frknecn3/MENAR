import { AxiosError } from "axios";
import type { ErrorRequestHandler, NextFunction, Request, Response } from "express";

export class AppError extends Error {

    statusCode: number;
    data?: unknown;
    details?: any


    constructor(message: string, statusCode: number, data: unknown, details: any) {
        super(message)

        this.statusCode = statusCode,
            this.data = data,
            this.details = details
    }
}

const handler: ErrorRequestHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).send({
            success: false,
            message: err.message,
            details: err.details
        })
    }

    if (err instanceof AxiosError) {
        console.log(err.response?.status, err.response?.statusText, err.request.res.responseUrl);

        return res.status(err.response?.status || 500).send({
            success: false,
            message: err.message,
        })

    }

    if (err instanceof Error) {
        // mesajın içindeki ilk 3 haneli sayıyı bul
        const match = err.message.match(/\d{3}/);

        // eğer sayı bulunduysa onu kullan, bulunamadıysa 500'e dön
        const extractedStatus = match ? parseInt(match[0]) : 500;

        // geçerli bir HTTP kodu mu kontrolü
        const finalStatus = (extractedStatus >= 400 && extractedStatus < 600)
            ? extractedStatus
            : 500;

        return res.status(finalStatus).json({
            success: false,
            message: err.message || "Internal Server Error"
        });
    }

    // hiçbiri değilse en genel hata
    res.status(500).json({ success: false, message: "Bilinmeyen Hata" });
}

export default handler;