import type { ErrorRequestHandler, NextFunction, Request, Response } from "express";

export class AppError extends Error {

    statusCode:number;
    data?:unknown;
    details?:any


    constructor(message:string,statusCode:number,data:unknown,details:any){
        super(message)

        this.statusCode = statusCode,
        this.data = data,
        this.details = details
    }
}

const handler: ErrorRequestHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err)

    if(err instanceof AppError) {
        return res.status(err.statusCode).send({
            success: false,
            message: err.message,
            details: err.details
        })
    }

    return res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    })
}

export default handler;