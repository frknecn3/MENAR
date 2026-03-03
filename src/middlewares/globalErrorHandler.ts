import type { ErrorRequestHandler, NextFunction, Request, Response } from "express";

const handler: ErrorRequestHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err)

    // if(err instanceof AppError)

    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    })
}

export default handler;