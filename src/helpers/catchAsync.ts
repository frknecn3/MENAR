import type { NextFunction, Request, RequestHandler, Response } from "express"

export const c =
    (fn: RequestHandler): RequestHandler =>
        (req: Request, res: Response, next: NextFunction) => {
            Promise.resolve(fn(req, res, next)).catch((err)=>{next(err)
            });
        };