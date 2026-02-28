import {useConflictHotspots, useConflictMeta} from "../hooks/useConflictData";
import {useMapStore} from "../store/useMapStore";
import {SEVERITY_COLORS, TREND_ICONS, TREND_COLORS} from "../constants/layers";
import type {ConflictHotspot} from "@worldmonitor/types";

const PANEL_W = 340;
const SEVERITY_ORDER = ["critical", "high", "medium", "low"] as const;

interface HotspotRowProps {
    hs: ConflictHotspot;
    onSelect: () => void;
}

interface SummaryStatsProps {
    hotspotCount: number;
    criticalCount: number;
    totalFatalities: number;
}

interface SeverityFilterProps {
    minSeverity: string;
    onSeverityChange: (severity: "critical" | "high" | "medium" | "low") => void;
}

interface HotspotListProps {
    hotspots: ConflictHotspot[];
    status: "pending" | "success" | "error";
    onSelect: (hs: ConflictHotspot) => void;
}

interface PanelHeaderProps {
    onClose: () => void;
    source?: string;
}

function HotspotRow({hs, onSelect}: HotspotRowProps) {
    const color = SEVERITY_COLORS[hs.severity];
    const trendIcon = TREND_ICONS[hs.trend] ?? "→";
    const trendColor = TREND_COLORS[hs.trend] ?? "#94a3b8";

    return (
        <div
            onClick={onSelect}
            style={{
                padding: "8px 14px",
                borderBottom: "1px solid #0a1e33",
                cursor: "pointer",
                transition: "background 0.15s"
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(248,113,113,0.04)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
            {/* Header row */}
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3}}>
                <div style={{display: "flex", alignItems: "center", gap: 6}}>
                    <div style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: color,
                        flexShrink: 0,
                        boxShadow: `0 0 4px ${color}`
                    }}/>
                    <span style={{fontSize: 10, fontWeight: 700, color: "#e2f0ff"}}>{hs.name}</span>
                </div>
                <div style={{display: "flex", gap: 6, alignItems: "center"}}>
                    <span style={{fontSize: 9, color: trendColor, fontWeight: 700}}>{trendIcon}</span>
                    <span
                        style={{fontSize: 8, color, border: `1px solid ${color}`, padding: "1px 4px", borderRadius: 2}}>
                        {hs.severity.toUpperCase()}
                    </span>
                </div>
            </div>

            {/* Sub row */}
            <div style={{display: "flex", justifyContent: "space-between", marginBottom: 4}}>
                <span style={{fontSize: 8, color: "#4a7a8a"}}>{hs.country}</span>
                <div style={{display: "flex", gap: 10}}>
                    <span style={{fontSize: 8, color: "#4a7a8a"}}>{hs.activeConflicts} events</span>
                    <span style={{fontSize: 8, color: hs.fatalities30d > 500 ? "#f87171" : "#4a7a8a"}}>
                        {hs.fatalities30d.toLocaleString()} fatalities
                    </span>
                </div>
            </div>

            {/* Actors */}
            <div style={{display: "flex", flexWrap: "wrap", gap: 3}}>
                {hs.actors.slice(0, 3).map((actor) => (
                    <span key={actor} style={{
                        fontSize: 7,
                        color: "#2a5a7a",
                        background: "#071523",
                        border: "1px solid #1a3a5c",
                        padding: "1px 5px",
                        borderRadius: 2
                    }}>
                        {actor.slice(0, 22)}
                    </span>
                ))}
            </div>
        </div>
    );
}

function SummaryStats({hotspotCount, criticalCount, totalFatalities}: SummaryStatsProps) {
    const stats = [
        {label: "ZONES", val: hotspotCount, color: "#f87171"},
        {label: "CRITICAL", val: criticalCount, color: "#ff2200"},
        {label: "FATALITIES (30d)", val: totalFatalities.toLocaleString(), color: "#f87171"},
    ];

    return (
        <div style={{display: "flex", gap: 10, marginTop: 10}}>
            {stats.map((s) => (
                <div key={s.label} style={{
                    flex: 1,
                    background: "#071523",
                    border: "1px solid #1a0a0a",
                    borderRadius: 3,
                    padding: "5px 8px",
                    textAlign: "center"
                }}>
                    <div style={{fontSize: 12, fontWeight: 700, color: s.color}}>{s.val}</div>
                    <div style={{fontSize: 7, color: "#2a5a7a", marginTop: 1}}>{s.label}</div>
                </div>
            ))}
        </div>
    );
}

function SeverityFilter({minSeverity, onSeverityChange}: SeverityFilterProps) {
    return (
        <div style={{marginTop: 8}}>
            <div style={{fontSize: 8, color: "#2a5a7a", marginBottom: 4}}>MIN SEVERITY</div>
            <div style={{display: "flex", gap: 4}}>
                {SEVERITY_ORDER.map((sev) => (
                    <button
                        key={sev}
                        onClick={() => onSeverityChange(sev)}
                        style={{
                            flex: 1,
                            padding: "3px 0",
                            fontSize: 8,
                            borderRadius: 2,
                            cursor: "pointer",
                            background: minSeverity === sev ? SEVERITY_COLORS[sev] + "33" : "transparent",
                            border: `1px solid ${minSeverity === sev ? SEVERITY_COLORS[sev] : "#1a3a5c"}`,
                            color: minSeverity === sev ? SEVERITY_COLORS[sev] : "#2a5a7a",
                        }}
                    >
                        {sev.slice(0, 4).toUpperCase()}
                    </button>
                ))}
            </div>
        </div>
    );
}

function PanelHeader({onClose, source}: PanelHeaderProps) {
    return (
        <div style={{padding: "12px 14px 10px", borderBottom: "1px solid #1a0a0a", flexShrink: 0}}>
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start"}}>
                <div>
                    <div style={{fontSize: 11, fontWeight: 700, color: "#e2f0ff", letterSpacing: "0.1em"}}>
                        CONFLICT INTEL
                    </div>
                    <div style={{fontSize: 9, color: "#2a5a7a", marginTop: 2}}>
                        SOURCE: {source?.toUpperCase() ?? "—"}
                        {source === "demo" && (
                            <span style={{color: "#f59e0b", marginLeft: 6}}>⚠ DEMO — add ACLED_API_KEY</span>
                        )}
                    </div>
                </div>
                <button
                    onClick={onClose}
                    style={{
                        fontSize: 11,
                        color: "#3a6a8a",
                        background: "transparent",
                        border: "1px solid #1a3a5c",
                        padding: "3px 8px",
                        borderRadius: 2,
                        cursor: "pointer"
                    }}
                >
                    ✕
                </button>
            </div>
        </div>
    );
}

function HotspotList({hotspots, status, onSelect}: HotspotListProps) {
    return (
        <div style={{flex: 1, overflowY: "auto"}}>
            {status === "pending" && (
                <div style={{padding: 20, fontSize: 10, color: "#2a5a7a", textAlign: "center"}}>Loading hotspots…</div>
            )}
            {status === "success" && hotspots.length === 0 && (
                <div style={{padding: 20, fontSize: 10, color: "#2a5a7a"}}>No zones match filter.</div>
            )}
            {status === "success" && hotspots.map((hs) => (
                <HotspotRow key={hs.id} hs={hs} onSelect={() => onSelect(hs)}/>
            ))}
        </div>
    );
}

export function ConflictPanel() {
    const {
        conflictPanelOpen,
        setConflictPanelOpen,
        setSelected,
        minConflictSeverity,
        setMinConflictSeverity
    } = useMapStore();
    const {data: hotspots, status} = useConflictHotspots();
    const {data: meta} = useConflictMeta();

    const severityRank = {low: 1, medium: 2, high: 3, critical: 4};
    const filtered = (hotspots ?? []).filter((h) => severityRank[h.severity] >= severityRank[minConflictSeverity]);

    const criticalCount = (hotspots ?? []).filter((h) => h.severity === "critical").length;
    const totalFatalities = (hotspots ?? []).reduce((s, h) => s + h.fatalities30d, 0);

    const handleHotspotSelect = (hs: ConflictHotspot) => {
        setSelected({
            name: hs.name,
            country: hs.country,
            severity: hs.severity,
            trend: `${TREND_ICONS[hs.trend]} ${hs.trend}`,
            conflicts: hs.activeConflicts,
            fatalities: hs.fatalities30d,
            actors: hs.actors.join(", "),
            source: hs.isDemo ? "demo" : "acled",
            lat: hs.lat,
            lon: hs.lon,
        });
    };

    return (
        <div
            style={{
                position: "absolute",
                top: 0,
                right: 0,
                bottom: 0,
                width: conflictPanelOpen ? PANEL_W : 0,
                background: "#040c18",
                borderLeft: conflictPanelOpen ? "1px solid #2a1a1a" : "none",
                transition: "width 0.25s ease",
                overflow: "hidden",
                zIndex: 40,
                display: "flex",
                flexDirection: "column",
            }}
        >
            {conflictPanelOpen && (
                <>
                    <PanelHeader onClose={() => setConflictPanelOpen(false)} source={meta?.source}/>

                    <div style={{padding: "12px 14px"}}>
                        <SummaryStats
                            hotspotCount={hotspots?.length ?? 0}
                            criticalCount={criticalCount}
                            totalFatalities={totalFatalities}
                        />
                        <SeverityFilter minSeverity={minConflictSeverity} onSeverityChange={setMinConflictSeverity}/>
                    </div>

                    <HotspotList hotspots={filtered} status={status} onSelect={handleHotspotSelect}/>

                    <div style={{padding: "6px 14px", borderTop: "1px solid #1a0a0a", fontSize: 9, color: "#1a3a5c"}}>
                        ACLED — Armed Conflict Location & Event Data Project
                    </div>
                </>
            )}
        </div>
    );
}