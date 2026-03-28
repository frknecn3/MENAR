import type { Request, RequestHandler, Response } from "express";
import { spawn } from "child_process";
import { c } from "../helpers/catchAsync";
import { AppResponse } from "../helpers/response";
import { AppError } from "../middlewares/globalErrorHandler";

const runFinancialRadarJob = (pageLimit: number): Promise<unknown> => {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn("python3", [
      "./src/python-processes/fetch_financial_radar_bist100.py",
      String(pageLimit),
    ]);

    let stdout = "";
    let stderr = "";

    pythonProcess.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    pythonProcess.on("error", (error) => {
      reject(new AppError(`Financial Radar süreci başlatılamadı: ${error.message}`, 500));
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        return reject(
          new AppError(
            "Financial Radar PDF işleme süreci başarısız oldu.",
            500,
            undefined,
            stderr || stdout || `Process exit code: ${code}`
          )
        );
      }

      try {
        const parsed = JSON.parse(stdout);
        resolve(parsed);
      } catch (error) {
        reject(
          new AppError(
            "Financial Radar çıktısı JSON olarak okunamadı.",
            500,
            undefined,
            error instanceof Error ? error.message : String(error)
          )
        );
      }
    });
  });
};

export const fetchFinancialRadarBist100WeeklyData: RequestHandler = c(
  async (req: Request, res: Response) => {
    const rawPageLimit = typeof req.query.pageLimit === "string" ? Number(req.query.pageLimit) : 50;
    const pageLimit = Number.isFinite(rawPageLimit) && rawPageLimit > 0 ? Math.floor(rawPageLimit) : 50;

    const result = await runFinancialRadarJob(pageLimit);

    return AppResponse(
      res,
      "Financial Radar BIST 100 haftalık JSON dosyaları oluşturuldu.",
      result
    );
  }
);
