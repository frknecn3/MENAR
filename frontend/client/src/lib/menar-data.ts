/* Design Philosophy Reminder: Modern Market Observatory — dark analytical workspace, engineered typography, luminous cyan/emerald signals, asymmetric data storytelling, and crisp modular chart panels. */
import rawHistory from "@/data/bist100_all_times.json";

export type MetricKey =
  | "deger_skoru"
  | "karlilik_skoru"
  | "buyume_skoru"
  | "momentum_skoru"
  | "quant_skoru"
  | "piotroski_f_skoru"
  | "magic_formula";

export type MenarPoint = {
  date: string;
  deger_skoru: number | null;
  karlilik_skoru: number | null;
  buyume_skoru: number | null;
  momentum_skoru: number | null;
  quant_skoru: number | null;
  piotroski_f_skoru: number | null;
  magic_formula: number | null;
};

export type TickerSummary = {
  ticker: string;
  recordCount: number;
  firstDate: string | null;
  lastDate: string | null;
  latestQuant: number | null;
  peakQuant: number | null;
};

type HistoryMap = Record<string, MenarPoint[]>;

export const metricMeta: Array<{ key: MetricKey; label: string; color: string }> = [
  { key: "deger_skoru", label: "Değer Skoru", color: "#71f0d3" },
  { key: "karlilik_skoru", label: "Karlılık Skoru", color: "#7dc4ff" },
  { key: "buyume_skoru", label: "Büyüme Skoru", color: "#95f089" },
  { key: "momentum_skoru", label: "Momentum Skoru", color: "#f3c46b" },
  { key: "quant_skoru", label: "Quant Skoru", color: "#b99cff" },
  { key: "piotroski_f_skoru", label: "Piotroski F", color: "#ff8b8b" },
  { key: "magic_formula", label: "Magic Formula", color: "#e7f27d" },
];

export const menarHistory = rawHistory as HistoryMap;

export const availableTickers = Object.keys(menarHistory).sort((left, right) =>
  left.localeCompare(right)
) as string[];

export const tickerSummaries: Record<string, TickerSummary> = Object.fromEntries(
  availableTickers.map(ticker => {
    const points = menarHistory[ticker] ?? [];
    const quantValues = points
      .map(point => point.quant_skoru)
      .filter((value): value is number => typeof value === "number");

    return [
      ticker,
      {
        ticker,
        recordCount: points.length,
        firstDate: points[0]?.date ?? null,
        lastDate: points.at(-1)?.date ?? null,
        latestQuant: quantValues.at(-1) ?? null,
        peakQuant: quantValues.length > 0 ? Math.max(...quantValues) : null,
      } satisfies TickerSummary,
    ];
  })
) as Record<string, TickerSummary>;
