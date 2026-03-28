import type { Request, RequestHandler, Response } from "express";
import { c } from "../helpers/catchAsync";
import { parseKapHtmlToMarkdown } from "../helpers/cleanHTML";
import { analyzeKapNotification } from "../llm/analystService";
import { AppResponse } from "../helpers/response";
import { spawn } from "child_process";
import { AppError } from "../middlewares/globalErrorHandler";

export const getStockData: RequestHandler = c(async (req: Request, res: Response) => {
    const pythonExec = './venv/bin/python'

    const pythonProcess = spawn(pythonExec, ['./src/python-processes/fetch_stock.py']);

    let dataString = '';

    // Collect the JSON string from Python
    pythonProcess.stdout.on('data', (data) => {
        dataString += data.toString();
    });

    // When Python finishes, parse the data
    pythonProcess.on('close', (code) => {
        if (code === 0) {
            try {
                const stockDetails = JSON.parse(dataString);
                console.log(`Successfully fetched data for: ${stockDetails.symbol}`);
                console.log(`Price: $${stockDetails.current_price}`);
                // You can now send this stockDetails object directly to your React frontend!
                return AppResponse(res, 'Hisse verileri getirildi.', stockDetails)
            } catch (err) {
                console.error("Failed to parse Python output:", err);
                throw new AppError('Python kodu okunurken hata gerçekleşti.', 500)

            }
        } else {
            console.error(`Python script exited with code ${code}`);
            throw new AppError('Python kodu çalışırken hata gerçekleşti.', 500)
        }
    });

})