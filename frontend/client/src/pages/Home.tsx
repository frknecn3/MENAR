/* Design Philosophy Reminder: Modern Market Observatory — keep this page dark, asymmetric, signal-driven, and analytically focused; use luminous cyan/emerald accents, dense but legible controls, and modular chart panels that feel like instruments rather than generic cards. */
import { useMemo, useState, type ChangeEvent } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  ArrowUpRight,
  Database,
  FolderUp,
  LineChart as LineChartIcon,
  Radar,
} from "lucide-react";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  availableTickers,
  menarHistory,
  metricMeta,
  tickerSummaries,
  type MetricKey,
} from "@/lib/menar-data";

type RadarRow = Record<string, string | number | null>;

type RadarSnapshot = {
  sourceName: string;
  reportDate: string;
  rows: RadarRow[];
  numericColumns: string[];
};

const HERO_IMAGE =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663394675923/FvdGZ4AqJqp8RAbzrqoyPh/menar-observatory-hero-YkdAQ7DggV2J92MdywQt5K.webp";
const SURFACE_IMAGE =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663394675923/FvdGZ4AqJqp8RAbzrqoyPh/menar-chart-surface-Ffj59E6LBsecpKTa3ha3cf.webp";
const ORBITAL_IMAGE =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663394675923/FvdGZ4AqJqp8RAbzrqoyPh/menar-metric-orbital-Y8yAP9AkUpRTZHxrayzAVT.webp";

const defaultMetrics: MetricKey[] = [
  "quant_skoru",
  "deger_skoru",
  "karlilik_skoru",
];

const metricLabelMap = Object.fromEntries(
  metricMeta.map(metric => [metric.key, metric.label])
) as Record<MetricKey, string>;

const chartConfig = Object.fromEntries(
  metricMeta.map(metric => [
    metric.key,
    {
      label: metric.label,
      color: metric.color,
    },
  ])
);

function formatTimelineDate(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatWeekDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

function normalizeKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const raw = value.trim();
  if (!raw) {
    return null;
  }

  const cleaned = raw.replace(/[₺$€£%]/g, "").replace(/\s+/g, "");
  const hasComma = cleaned.includes(",");
  const hasDot = cleaned.includes(".");

  let normalized = cleaned;

  if (hasComma && hasDot) {
    normalized =
      cleaned.lastIndexOf(",") > cleaned.lastIndexOf(".")
        ? cleaned.replace(/\./g, "").replace(/,/g, ".")
        : cleaned.replace(/,/g, "");
  } else if (hasComma) {
    const parts = cleaned.split(",");
    normalized =
      parts.length === 2 && parts[1].length <= 2
        ? cleaned.replace(/,/g, ".")
        : cleaned.replace(/,/g, "");
  }

  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function extractRows(payload: unknown): RadarRow[] {
  if (!payload || typeof payload !== "object") {
    return [];
  }

  const candidate = payload as Record<string, unknown>;
  const possibleRows = [
    candidate.rows,
    candidate.records,
    candidate.data,
    candidate.table,
    candidate.tableRows,
    candidate.items,
  ];

  for (const option of possibleRows) {
    if (Array.isArray(option) && option.every(row => row && typeof row === "object")) {
      return option as RadarRow[];
    }

    if (
      option &&
      typeof option === "object" &&
      Array.isArray((option as Record<string, unknown>).rows)
    ) {
      return (option as { rows: RadarRow[] }).rows;
    }
  }

  return [];
}

function extractReportDate(payload: unknown, fallbackName: string) {
  if (!payload || typeof payload !== "object") {
    return fallbackName;
  }

  const candidate = payload as Record<string, unknown>;
  const metadata =
    candidate.metadata && typeof candidate.metadata === "object"
      ? (candidate.metadata as Record<string, unknown>)
      : undefined;

  const sources = [
    candidate.reportDate,
    candidate.report_date,
    candidate.date,
    candidate.week,
    metadata?.reportDate,
    metadata?.report_date,
    metadata?.date,
    metadata?.publishedAt,
    metadata?.published_at,
    metadata?.week,
  ];

  for (const source of sources) {
    if (typeof source === "string" && source.trim()) {
      return source;
    }
  }

  return fallbackName.replace(/\.json$/i, "");
}

function resolveTickerFromRow(row: RadarRow) {
  const aliases = [
    "ticker",
    "hisse",
    "hissekodu",
    "kod",
    "symbol",
    "companycode",
    "stock",
  ];

  for (const [key, value] of Object.entries(row)) {
    if (!aliases.includes(normalizeKey(key))) {
      continue;
    }

    if (typeof value === "string" && value.trim()) {
      return value.trim().toUpperCase().replace(/\.IS$/i, "");
    }
  }

  return undefined;
}

function detectNumericColumns(rows: RadarRow[]) {
  const counts = new Map<string, number>();

  rows.forEach(row => {
    Object.entries(row).forEach(([key, value]) => {
      if (toNumber(value) !== null) {
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    });
  });

  return Array.from(counts.entries())
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([key]) => key);
}

async function parseRadarFiles(fileList: FileList) {
  const files = Array.from(fileList);

  const snapshots = await Promise.all(
    files.map(async file => {
      const payload = JSON.parse(await file.text()) as unknown;
      const rows = extractRows(payload);

      return {
        sourceName: file.name,
        reportDate: extractReportDate(payload, file.name),
        rows,
        numericColumns: detectNumericColumns(rows),
      } satisfies RadarSnapshot;
    })
  );

  return snapshots.sort((left, right) => {
    const leftTime = new Date(left.reportDate).getTime();
    const rightTime = new Date(right.reportDate).getTime();

    if (Number.isNaN(leftTime) || Number.isNaN(rightTime)) {
      return left.reportDate.localeCompare(right.reportDate);
    }

    return leftTime - rightTime;
  });
}

export default function Home() {
  const [primaryTicker, setPrimaryTicker] = useState(
    availableTickers.includes("ASTOR") ? "ASTOR" : availableTickers[0]
  );
  const [comparisonTicker, setComparisonTicker] = useState(
    availableTickers.includes("ENKAI") ? "ENKAI" : availableTickers[1]
  );
  const [comparisonMetric, setComparisonMetric] =
    useState<MetricKey>("quant_skoru");
  const [activeMetrics, setActiveMetrics] =
    useState<MetricKey[]>(defaultMetrics);
  const [uploadedSnapshots, setUploadedSnapshots] = useState<RadarSnapshot[]>([]);
  const [selectedRadarMetric, setSelectedRadarMetric] = useState<string>("");
  const [uploadError, setUploadError] = useState<string>("");

  const primarySeries = menarHistory[primaryTicker] ?? [];
  const comparisonSeries = menarHistory[comparisonTicker] ?? [];
  const summary = tickerSummaries[primaryTicker];

  const timelineData = useMemo(
    () =>
      primarySeries.map(point => ({
        ...point,
        label: formatTimelineDate(point.date),
      })),
    [primarySeries]
  );

  const latestPoint = primarySeries.at(-1);

  const comparisonData = useMemo(() => {
    const byDate = new Map(
      comparisonSeries.map(point => [point.date, point[comparisonMetric]])
    );

    return primarySeries.map(point => ({
      label: formatTimelineDate(point.date),
      primary: point[comparisonMetric],
      comparison: byDate.get(point.date) ?? null,
    }));
  }, [comparisonMetric, comparisonSeries, primarySeries]);

  const latestMetricBars = useMemo(
    () =>
      metricMeta.map(metric => ({
        metric: metric.label,
        key: metric.key,
        value: latestPoint?.[metric.key] ?? 0,
        fill: metric.color,
      })),
    [latestPoint]
  );

  const radarColumns = useMemo(() => {
    const unique = new Set<string>();
    uploadedSnapshots.forEach(snapshot => {
      snapshot.numericColumns.forEach(column => unique.add(column));
    });
    return Array.from(unique);
  }, [uploadedSnapshots]);

  const effectiveRadarMetric = selectedRadarMetric || radarColumns[0] || "";

  const radarTrendData = useMemo(() => {
    if (!effectiveRadarMetric) {
      return [];
    }

    return uploadedSnapshots
      .map(snapshot => {
        const row = snapshot.rows.find(item => resolveTickerFromRow(item) === primaryTicker);
        const value = row ? toNumber(row[effectiveRadarMetric]) : null;

        return {
          label: formatWeekDate(snapshot.reportDate),
          value,
          sourceName: snapshot.sourceName,
        };
      })
      .filter(item => item.value !== null);
  }, [effectiveRadarMetric, primaryTicker, uploadedSnapshots]);

  const latestRadarValue = radarTrendData.at(-1)?.value ?? null;

  const handleMetricToggle = (metric: MetricKey) => {
    setActiveMetrics(current => {
      if (current.includes(metric)) {
        return current.length === 1 ? current : current.filter(item => item !== metric);
      }

      return [...current, metric];
    });
  };

  const handleRadarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) {
      return;
    }

    try {
      const parsed = await parseRadarFiles(fileList);
      setUploadedSnapshots(parsed);
      setSelectedRadarMetric(parsed.flatMap(item => item.numericColumns)[0] ?? "");
      setUploadError("");
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : "The uploaded files could not be parsed as MENAR weekly JSON."
      );
    }
  };

  return (
    <div className="observatory-shell">
      <div className="observatory-noise" />
      <div className="observatory-orb observatory-orb-cyan" />
      <div className="observatory-orb observatory-orb-emerald" />

      <main className="container relative py-8 lg:py-10">
        <section className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="observatory-panel observatory-sidebar lg:sticky lg:top-6 lg:self-start">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="observatory-kicker">MENAR historical workbench</div>
                <h1 className="observatory-sidebar-title">Signal room</h1>
              </div>
              <div className="observatory-badge">
                <Radar className="h-4 w-4" />
                BIST
              </div>
            </div>

            <div className="observatory-section-gap">
              <div className="observatory-field">
                <label htmlFor="primaryTicker">Primary company</label>
                <select
                  id="primaryTicker"
                  value={primaryTicker}
                  onChange={event => setPrimaryTicker(event.target.value)}
                  className="observatory-select"
                >
                  {availableTickers.map(ticker => (
                    <option key={ticker} value={ticker}>
                      {ticker}
                    </option>
                  ))}
                </select>
              </div>

              <div className="observatory-field">
                <label htmlFor="comparisonTicker">Comparison company</label>
                <select
                  id="comparisonTicker"
                  value={comparisonTicker}
                  onChange={event => setComparisonTicker(event.target.value)}
                  className="observatory-select"
                >
                  {availableTickers
                    .filter(ticker => ticker !== primaryTicker)
                    .map(ticker => (
                      <option key={ticker} value={ticker}>
                        {ticker}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="observatory-divider" />

            <div className="observatory-section-gap">
              <div>
                <p className="observatory-label">Visible metrics</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {metricMeta.map(metric => {
                    const active = activeMetrics.includes(metric.key);
                    return (
                      <button
                        key={metric.key}
                        type="button"
                        onClick={() => handleMetricToggle(metric.key)}
                        className={active ? "metric-pill metric-pill-active" : "metric-pill"}
                      >
                        <span
                          className="metric-pill-dot"
                          style={{ backgroundColor: metric.color }}
                        />
                        {metric.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="observatory-field">
                <label htmlFor="comparisonMetric">Comparison metric</label>
                <select
                  id="comparisonMetric"
                  value={comparisonMetric}
                  onChange={event =>
                    setComparisonMetric(event.target.value as MetricKey)
                  }
                  className="observatory-select"
                >
                  {metricMeta.map(metric => (
                    <option key={metric.key} value={metric.key}>
                      {metric.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="observatory-divider" />

            <div className="observatory-section-gap">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="observatory-label">Weekly radar importer</p>
                  <p className="observatory-muted mt-1 text-sm">
                    Load MENAR weekly JSON exports to extend the timeline beyond the built-in all-times archive.
                  </p>
                </div>
                <FolderUp className="h-4 w-4 text-[var(--signal-cyan)]" />
              </div>

              <label className="upload-zone">
                <input
                  type="file"
                  accept=".json,application/json"
                  multiple
                  onChange={handleRadarUpload}
                  className="sr-only"
                />
                <span className="upload-zone-title">Drop weekly JSON files</span>
                <span className="upload-zone-copy">
                  The parser looks for rows, records, or table rows and then detects the numeric columns automatically.
                </span>
              </label>

              {uploadedSnapshots.length > 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/4 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="observatory-label">Loaded weekly snapshots</span>
                    <span className="observatory-badge">{uploadedSnapshots.length} files</span>
                  </div>

                  <div className="mt-3 observatory-field">
                    <label htmlFor="radarMetric">Uploaded metric column</label>
                    <select
                      id="radarMetric"
                      value={effectiveRadarMetric}
                      onChange={event => setSelectedRadarMetric(event.target.value)}
                      className="observatory-select"
                    >
                      {radarColumns.map(column => (
                        <option key={column} value={column}>
                          {column}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : null}

              {uploadError ? <p className="text-sm text-rose-300">{uploadError}</p> : null}
            </div>
          </aside>

          <div className="grid gap-6">
            <section className="hero-panel overflow-hidden">
              <img src={HERO_IMAGE} alt="" className="hero-image" />
              <div className="hero-overlay" />
              <div className="relative z-10 grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_300px]">
                <div className="max-w-3xl">
                  <div className="observatory-kicker">Dark observatory interface</div>
                  <h2 className="hero-title">
                    Historical score signals for <span>{primaryTicker}</span> powered by the repository all-times archive and ready for MENAR weekly radar backfills.
                  </h2>
                  <p className="hero-copy">
                    This SPA now uses the repository’s <code>bist100_all_times.json</code> dataset as its built-in timeline source and adds a simple upload workflow for weekly JSON files extracted from Financial Radar tables.
                  </p>

                  <div className="hero-tags">
                    <div className="observatory-badge">{summary.recordCount} observations</div>
                    <div className="observatory-badge">Latest quant {summary.latestQuant ?? "—"}</div>
                    <div className="observatory-badge">Peak quant {summary.peakQuant ?? "—"}</div>
                  </div>
                </div>

                <div className="hero-orbital-card">
                  <img src={ORBITAL_IMAGE} alt="" className="hero-orbital-image" />
                  <div className="hero-orbital-copy">
                    <p className="observatory-kicker">Live focus</p>
                    <div className="hero-orbital-value">{primaryTicker}</div>
                    <p className="observatory-muted">
                      Built-in timeline loaded from <code>bist100_all_times.json</code>. Upload weekly files to add Financial Radar columns as separate history lines.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
              <div className="signal-card">
                <div className="signal-card-icon">
                  <Activity className="h-4 w-4" />
                </div>
                <p className="observatory-label">Latest quant score</p>
                <div className="signal-card-value">{summary.latestQuant ?? "—"}</div>
                <p className="observatory-muted">Current quant level for {primaryTicker}</p>
              </div>

              <div className="signal-card">
                <div className="signal-card-icon">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
                <p className="observatory-label">Peak quant score</p>
                <div className="signal-card-value">{summary.peakQuant ?? "—"}</div>
                <p className="observatory-muted">Best observed quant level in the all-times archive</p>
              </div>

              <div className="signal-card">
                <div className="signal-card-icon">
                  <Database className="h-4 w-4" />
                </div>
                <p className="observatory-label">Observation window</p>
                <div className="signal-card-value text-2xl">
                  {summary.recordCount}
                </div>
                <p className="observatory-muted">Chronological points available for this ticker</p>
              </div>

              <div className="signal-card">
                <div className="signal-card-icon">
                  <LineChartIcon className="h-4 w-4" />
                </div>
                <p className="observatory-label">Imported weekly files</p>
                <div className="signal-card-value text-2xl">
                  {uploadedSnapshots.length}
                </div>
                <p className="observatory-muted">Financial Radar snapshots loaded into the browser</p>
              </div>
            </section>

            <section className="observatory-grid-2">
              <article className="chart-panel chart-panel-large">
                <div className="chart-panel-header">
                  <div>
                    <p className="observatory-kicker">Plot 01</p>
                    <h3 className="chart-title">Multi-metric historical timeline</h3>
                  </div>
                  <p className="observatory-muted max-w-md text-sm">
                    Follow the selected score factors across time for a single company using the latest aggregated MENAR history. Use the signal pills in the side rail to reveal or hide specific dimensions.
                  </p>
                </div>

                <div className="chart-stage" style={{ backgroundImage: `url(${SURFACE_IMAGE})` }}>
                  <ChartContainer config={chartConfig} className="h-[390px] w-full">
                    <LineChart data={timelineData} margin={{ left: 8, right: 12, top: 12, bottom: 0 }}>
                      <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" />
                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={false}
                        minTickGap={40}
                      />
                      <YAxis tickLine={false} axisLine={false} width={42} />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            labelClassName="text-white"
                            formatter={(value, name) => (
                              <div className="flex min-w-[180px] items-center justify-between gap-3">
                                <span className="text-slate-300">
                                  {metricLabelMap[name as MetricKey] ?? name}
                                </span>
                                <span className="font-mono text-white">
                                  {typeof value === "number"
                                    ? value.toLocaleString()
                                    : String(value)}
                                </span>
                              </div>
                            )}
                          />
                        }
                      />
                      <ChartLegend content={<ChartLegendContent />} />
                      {activeMetrics.map(metric => {
                        const meta = metricMeta.find(item => item.key === metric);
                        return (
                          <Line
                            key={metric}
                            type="monotone"
                            dataKey={metric}
                            stroke={meta?.color}
                            strokeWidth={2.5}
                            dot={false}
                            activeDot={{ r: 4, fill: meta?.color }}
                          />
                        );
                      })}
                    </LineChart>
                  </ChartContainer>
                </div>
              </article>

              <article className="chart-panel">
                <div className="chart-panel-header">
                  <div>
                    <p className="observatory-kicker">Plot 02</p>
                    <h3 className="chart-title">Latest factor profile</h3>
                  </div>
                  <p className="observatory-muted text-sm">
                    A quick cross-sectional read of the most recent point for each MENAR score field.
                  </p>
                </div>

                <ChartContainer config={chartConfig} className="h-[390px] w-full">
                  <BarChart data={latestMetricBars} margin={{ left: 8, right: 12, top: 8, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" />
                    <XAxis
                      dataKey="metric"
                      tickLine={false}
                      axisLine={false}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis tickLine={false} axisLine={false} width={42} />
                    <ChartTooltip
                      content={<ChartTooltipContent hideLabel indicator="line" />}
                    />
                    <Bar dataKey="value" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </article>
            </section>

            <section className="observatory-grid-2">
              <article className="chart-panel">
                <div className="chart-panel-header">
                  <div>
                    <p className="observatory-kicker">Plot 03</p>
                    <h3 className="chart-title">Ticker-versus-ticker comparison</h3>
                  </div>
                  <p className="observatory-muted text-sm">
                    Compare {primaryTicker} against {comparisonTicker} on the selected score factor.
                  </p>
                </div>

                <ChartContainer
                  config={{
                    primary: {
                      label: primaryTicker,
                      color: "#71f0d3",
                    },
                    comparison: {
                      label: comparisonTicker,
                      color: "#7dc4ff",
                    },
                  }}
                  className="h-[360px] w-full"
                >
                  <AreaChart data={comparisonData} margin={{ left: 8, right: 12, top: 12, bottom: 0 }}>
                    <defs>
                      <linearGradient id="primaryFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#71f0d3" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#71f0d3" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="comparisonFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7dc4ff" stopOpacity={0.28} />
                        <stop offset="95%" stopColor="#7dc4ff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={40} />
                    <YAxis tickLine={false} axisLine={false} width={42} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Area
                      type="monotone"
                      dataKey="primary"
                      stroke="#71f0d3"
                      fill="url(#primaryFill)"
                      strokeWidth={2.2}
                    />
                    <Area
                      type="monotone"
                      dataKey="comparison"
                      stroke="#7dc4ff"
                      fill="url(#comparisonFill)"
                      strokeWidth={2.2}
                    />
                  </AreaChart>
                </ChartContainer>
              </article>

              <article className="chart-panel">
                <div className="chart-panel-header">
                  <div>
                    <p className="observatory-kicker">Plot 04</p>
                    <h3 className="chart-title">Uploaded Financial Radar trend</h3>
                  </div>
                  <p className="observatory-muted text-sm">
                    Once weekly MENAR JSON files are loaded, this panel extracts the chosen numeric column for {primaryTicker} and turns it into a longer horizon series.
                  </p>
                </div>

                {radarTrendData.length > 0 ? (
                  <ChartContainer
                    config={{
                      radarMetric: {
                        label: effectiveRadarMetric,
                        color: "#f3c46b",
                      },
                    }}
                    className="h-[360px] w-full"
                  >
                    <LineChart data={radarTrendData} margin={{ left: 8, right: 12, top: 12, bottom: 0 }}>
                      <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" />
                      <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={24} />
                      <YAxis tickLine={false} axisLine={false} width={42} />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value) => (
                              <div className="flex min-w-[160px] items-center justify-between gap-3">
                                <span className="text-slate-300">{effectiveRadarMetric}</span>
                                <span className="font-mono text-white">
                                  {typeof value === "number"
                                    ? value.toLocaleString()
                                    : String(value)}
                                </span>
                              </div>
                            )}
                          />
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#f3c46b"
                        strokeWidth={2.4}
                        dot={{ r: 3, fill: "#f3c46b" }}
                        activeDot={{ r: 5, fill: "#f3c46b" }}
                      />
                    </LineChart>
                  </ChartContainer>
                ) : (
                  <div className="empty-stage">
                    <FolderUp className="h-7 w-7 text-[var(--signal-cyan)]" />
                    <h4>Weekly radar files not loaded yet</h4>
                    <p>
                      Import the JSON files produced by MENAR’s Financial Radar extraction function to build a second historical layer from tabular weekly PDFs on top of the all-times archive.
                    </p>
                  </div>
                )}
              </article>
            </section>

            <section className="chart-panel">
              <div className="chart-panel-header">
                <div>
                  <p className="observatory-kicker">System note</p>
                  <h3 className="chart-title">How this SPA cooperates with MENAR</h3>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <div className="note-card">
                  <span className="note-index">01</span>
                  <h4>Pasted score archive</h4>
                  <p>
                    The bundled dataset now comes from <code>bist100_all_times.json</code> and already contains {availableTickers.length} tickers with score histories such as değer, kârlılık, büyüme, momentum, quant, Piotroski F, and Magic Formula.
                  </p>
                </div>
                <div className="note-card">
                  <span className="note-index">02</span>
                  <h4>Weekly MENAR exports</h4>
                  <p>
                    The file importer is designed for the weekly JSON files generated from the “BIST 100 Temel Skorları” page, so tabular PDF outputs can become time-series inputs inside the browser.
                  </p>
                </div>
                <div className="note-card">
                  <span className="note-index">03</span>
                  <h4>Historical extension path</h4>
                  <p>
                    As more weekly files are extracted, the imported plot becomes the bridge between the current aggregated archive and the longer MENAR history you are building.
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-white/10 bg-white/4 px-5 py-4 text-sm text-slate-300">
                <strong className="text-white">Current focus:</strong> {primaryTicker} | Latest uploaded radar value: {latestRadarValue ?? "—"} | First data point: {formatWeekDate(summary.firstDate ?? "N/A")}
              </div>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}
