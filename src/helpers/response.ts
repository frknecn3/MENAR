import type { Response } from "express"

export const AppResponse = (res: Response, message: string, data?: any, code: number = 200) => {

    return res.status(code).send({
        message,
        data
    })
}