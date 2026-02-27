import {
    LineChart, Line, XAxis, YAxis, Tooltip,
    ResponsiveContainer, ReferenceLine,
} from "recharts";
import type { FREDSeries } from "@worldmonitor/types";
import { useEconomicIndicators } from "../hooks/useEconomicData";
import { useMapStore } from "../store/useMapStore";

const PANEL_W = 340;

// Color per series
const SERIES_COLOR: Record<string, string> = {
    UNRATE:     "#38bdf8",
    CPIAUCSL:   "#f59e0b",
    FEDFUNDS:   "#818cf8",
    DCOILWTICO: "#34d399",
    T10Y2Y:     "#f87171",
};

function sparkData(s: FREDSeries) {
    return s.observations
        .filter((o) => o.value !== null)
        .slice(-24)
        .map((o) => ({ date: o.date.slice(0, 7), v: o.value as number }));
}

function latestValue(s: FREDSeries) {
    const obs = s.observations.filter((o) => o.value !== null);
    return obs.at(-1)?.value ?? null;
}

function trend(s: FREDSeries) {
    const obs = s.observations.filter((o) => o.value !== null);
    if (obs.length < 2) return "—";
    const diff = (obs.at(-1)!.value as number) - (obs.at(-2)!.value as number);
    if (Math.abs(diff) < 0.01) return "→";
    return diff > 0 ? "↑" : "↓";
}

function trendColor(id: string, dir: string) {
    // For these: up is bad
    const upIsBad = ["UNRATE", "CPIAUCSL"];
    if (dir === "→") return "#94a3b8";
    if (upIsBad.includes(id)) return dir === "↑" ? "#f87171" : "#34d399";
    // Fed funds & oil: context dependent → neutral color
    return dir === "↑" ? "#34d399" : "#f87171";
}

interface MiniChartProps { series: FREDSeries }
function MiniChart({ series }: MiniChartProps) {
    const data  = sparkData(series);
    const color = SERIES_COLOR[series.id] ?? "#94b8d4";
    const val   = latestValue(series);
    const dir   = trend(series);

    return (
        <div style={{ padding: "10px 14px", borderBottom: "1px solid #0a1e33" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                <span style={{ fontSize: 9, color: "#4a7a8a", letterSpacing: "0.1em" }}>{series.id}</span>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color }}>{val?.toFixed(2)}</span>
                    <span style={{ fontSize: 11, color: "#4a7a8a" }}>{series.units}</span>
                    <span style={{ fontSize: 14, color: trendColor(series.id, dir) }}>{dir}</span>
                </div>
            </div>
            <div style={{ fontSize: 10, color: "#2a5a7a", marginBottom: 6 }}>{series.title}</div>
            <ResponsiveContainer width="100%" height={50}>
                <LineChart data={data} margin={{ top: 2, right: 2, left: -28, bottom: 0 }}>
                    <XAxis dataKey="date" hide />
                    <YAxis domain={["auto", "auto"]} tick={{ fontSize: 7, fill: "#2a5a7a" }} />
                    {series.id === "T10Y2Y" && (
                        <ReferenceLine y={0} stroke="#f87171" strokeDasharray="3 3" strokeWidth={0.8} />
                    )}
                    <Tooltip
                        contentStyle={{ background: "#040c18", border: "1px solid #1a3a5c", fontSize: 9, borderRadius: 3 }}
                        labelStyle={{ color: "#4a7a8a" }}
                        itemStyle={{ color }}
                        formatter={(v: number) => [`${v.toFixed(2)} ${series.units}`, series.id]}
                    />
                    <Line
                        type="monotone" dataKey="v"
                        stroke={color} strokeWidth={1.5}
                        dot={false} activeDot={{ r: 3, fill: color }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export function EconomicPanel() {
    const { economicPanelOpen, setEconomicPanelOpen } = useMapStore();
    const { data, status } = useEconomicIndicators();

    return (
        <div style={{
            position: "absolute", top: 0, right: 0, bottom: 0,
            width: economicPanelOpen ? PANEL_W : 0,
            background: "#040c18",
            borderLeft: economicPanelOpen ? "1px solid #0f2a44" : "none",
            transition: "width 0.25s ease",
            overflow: "hidden",
            zIndex: 40,
            display: "flex", flexDirection: "column",
        }}>
            {economicPanelOpen && (
                <>
                    {/* Panel header */}
                    <div style={{ padding: "12px 14px 10px", borderBottom: "1px solid #0a1e33", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#e2f0ff", letterSpacing: "0.1em" }}>ECONOMIC INTEL</div>
                            <div style={{ fontSize: 9, color: "#2a5a7a", marginTop: 2 }}>
                                SOURCE: FRED · ST. LOUIS FED
                                {data?.[0]?.isDemo && (
                                    <span style={{ color: "#f59e0b", marginLeft: 6 }}>⚠ DEMO — add FRED_API_KEY</span>
                                )}
                            </div>
                        </div>
                        <button onClick={() => setEconomicPanelOpen(false)} style={{ fontSize: 11, color: "#3a6a8a", background: "transparent", border: "1px solid #1a3a5c", padding: "3px 8px", borderRadius: 2, cursor: "pointer" }}>✕</button>
                    </div>

                    {/* Charts */}
                    <div style={{ flex: 1, overflowY: "auto" }}>
                        {status === "pending" && (
                            <div style={{ padding: 20, fontSize: 10, color: "#2a5a7a", textAlign: "center" }}>
                                Loading indicators…
                            </div>
                        )}
                        {status === "error" && (
                            <div style={{ padding: 20, fontSize: 10, color: "#f87171" }}>
                                Failed to load. Check API key in .env
                            </div>
                        )}
                        {status === "success" && data?.map((s) => (
                            <MiniChart key={s.id} series={s} />
                        ))}
                    </div>

                    {/* Footer note */}
                    <div style={{ padding: "6px 14px", borderTop: "1px solid #0a1e33", fontSize: 9, color: "#1a3a5c" }}>
                        FRED® is a registered trademark of the Federal Reserve Bank of St. Louis
                    </div>
                </>
            )}
        </div>
    );
}