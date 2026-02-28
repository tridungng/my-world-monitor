import { LAYER_DEFS, BRANCH_COLORS, EONET_STYLES } from "../constants/layers";
import { useMapStore } from "../store/useMapStore";
import type { Earthquake, EONETEvent } from "@worldmonitor/types";
import { DisasterFeed } from "./DisasterFeed";

interface Props {
    uniqueBranches: string[];
    baseCount: number;
    earthquakes: Earthquake[];
    eonet: EONETEvent[];
}

const STATIC_LAYERS = LAYER_DEFS.filter((l) => l.category === "static");
const LIVE_LAYERS   = LAYER_DEFS.filter((l) => l.category === "live");

export function Sidebar({ uniqueBranches, baseCount, earthquakes, eonet }: Props) {
    const {
        layers, toggleLayer,
        selected, setSelected,
        filterBranch, setFilterBranch,
        minMagnitude, setMinMagnitude,
        eonetCategories, toggleEonetCategory,
        showMilitaryFlightsOnly, setShowMilitaryFlightsOnly,
        flightStreamStatus, flightCount,
    } = useMapStore();

    return (
        <div style={{ width: 280, background: "#040c18", borderRight: "1px solid #0f2a44", display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0 }}>

            {/* ── Static layers ── */}
            <section style={{ padding: "12px 14px 8px", borderBottom: "1px solid #0a1e33" }}>
                <div style={{ fontSize: 9, letterSpacing: "0.15em", color: "#2a5a7a", marginBottom: 8 }}>STATIC LAYERS</div>
                {STATIC_LAYERS.map((ld) => (
                    <LayerToggle key={ld.id} ld={ld} active={layers[ld.id]} onToggle={() => toggleLayer(ld.id)} />
                ))}
            </section>

            {/* ── Live layers + sub-filters ── */}
            <section style={{ padding: "10px 14px 8px", borderBottom: "1px solid #0a1e33" }}>
                <div style={{ fontSize: 9, letterSpacing: "0.15em", color: "#2a5a7a", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                    LIVE FEEDS
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#00ff88", display: "inline-block", boxShadow: "0 0 4px #00ff88" }} />
                </div>

                {LIVE_LAYERS.map((ld) => (
                    <LayerToggle key={ld.id} ld={ld} active={layers[ld.id]} onToggle={() => toggleLayer(ld.id)} />
                ))}

                {/* Flight sub-filters */}
                {layers.flights && (
                    <div style={{ margin: "6px 0 2px", padding: "6px 8px", background: "#071523", border: "1px solid #1a3a5c", borderRadius: 3 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontSize: 8, color: "#4a7a8a" }}>
                STREAM: <span style={{ color: flightStreamStatus === "live" ? "#00ff88" : "#f59e0b" }}>{flightStreamStatus.toUpperCase()}</span>
              </span>
                            <span style={{ fontSize: 8, color: "#34d399" }}>{flightCount.toLocaleString()} aircraft</span>
                        </div>
                        <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 9, color: "#94b8d4" }}>
                            <input
                                type="checkbox"
                                checked={showMilitaryFlightsOnly}
                                onChange={(e) => setShowMilitaryFlightsOnly(e.target.checked)}
                                style={{ accentColor: "#f59e0b" }}
                            />
                            Military only <span style={{ color: "#f59e0b" }}>✦</span>
                        </label>
                    </div>
                )}

                {/* Earthquake magnitude slider */}
                {layers.earthquakes && (
                    <div style={{ margin: "6px 0 2px", padding: "6px 8px", background: "#071523", border: "1px solid #1a3a5c", borderRadius: 3 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ fontSize: 8, color: "#4a7a8a" }}>MIN MAGNITUDE</span>
                            <span style={{ fontSize: 9, color: "#ff6b35", fontWeight: 700 }}>M{minMagnitude.toFixed(1)}+</span>
                        </div>
                        <input type="range" min={4} max={8} step={0.5} value={minMagnitude}
                               onChange={(e) => setMinMagnitude(parseFloat(e.target.value))}
                               style={{ width: "100%", accentColor: "#ff6b35" }} />
                    </div>
                )}

                {/* EONET category filter */}
                {layers.eonet && (
                    <div style={{ marginTop: 6 }}>
                        <div style={{ fontSize: 8, color: "#2a5a7a", marginBottom: 4 }}>EONET CATEGORIES</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                            {Object.entries(EONET_STYLES).filter(([k]) => k !== "default").map(([cat, style]) => (
                                <button key={cat} onClick={() => toggleEonetCategory(cat)} title={cat}
                                        style={{ padding: "2px 5px", fontSize: 10, borderRadius: 2, cursor: "pointer",
                                            background: eonetCategories.has(cat) ? style.color + "22" : "transparent",
                                            border: `1px solid ${eonetCategories.has(cat) ? style.color : "#1a3a5c"}`,
                                            color: eonetCategories.has(cat) ? style.color : "#2a4a5a" }}>
                                    {style.icon}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </section>

            {/* ── Branch filter ── */}
            <section style={{ padding: "10px 14px 8px", borderBottom: "1px solid #0a1e33" }}>
                <div style={{ fontSize: 9, letterSpacing: "0.15em", color: "#2a5a7a", marginBottom: 8 }}>BRANCH FILTER</div>
                <select value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)}
                        style={{ width: "100%", background: "#071523", border: "1px solid #1a3a5c", color: "#94b8d4", padding: "6px 8px", fontSize: 10, borderRadius: 3 }}>
                    {uniqueBranches.map((b) => <option key={b} value={b}>{b === "ALL" ? "ALL BRANCHES" : b}</option>)}
                </select>
            </section>

            {/* ── Legend ── */}
            <section style={{ padding: "10px 14px 8px", borderBottom: "1px solid #0a1e33" }}>
                <div style={{ fontSize: 9, letterSpacing: "0.15em", color: "#2a5a7a", marginBottom: 6 }}>BASE LEGEND</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 8px" }}>
                    {Object.entries(BRANCH_COLORS).map(([branch, color]) => (
                        <div key={branch} style={{ display: "flex", alignItems: "center", gap: 5, padding: "2px 0" }}>
                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0, boxShadow: `0 0 3px ${color}` }} />
                            <span style={{ fontSize: 8, color: "#4a7a8a", whiteSpace: "nowrap" }}>{branch}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Live disaster feed ── */}
            <DisasterFeed earthquakes={earthquakes} eonet={eonet} />

            {/* ── Selected object ── */}
            <section style={{ padding: "10px 14px", flex: 1, overflow: "auto" }}>
                <div style={{ fontSize: 9, letterSpacing: "0.15em", color: "#2a5a7a", marginBottom: 8 }}>SELECTED OBJECT</div>
                {selected ? (
                    <div style={{ background: "#071523", border: "1px solid #1a3a5c", borderRadius: 4, padding: 10 }}>
                        <div style={{ fontSize: 11, color: "#38bdf8", fontWeight: 700, marginBottom: 6 }}>{selected.name}</div>
                        {Object.entries(selected).filter(([k]) => k !== "name" && k !== "id").map(([k, v]) => (
                            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", borderBottom: "1px solid #0a1e33" }}>
                                <span style={{ fontSize: 9, color: "#2a5a7a" }}>{k.toUpperCase()}</span>
                                <span style={{ fontSize: 9, color: "#94b8d4" }}>{String(v)}</span>
                            </div>
                        ))}
                        <button onClick={() => setSelected(null)} style={{ marginTop: 8, fontSize: 9, color: "#3a6a8a", padding: "3px 8px", border: "1px solid #1a3a5c", borderRadius: 2, background: "transparent", cursor: "pointer" }}>
                            CLEAR ✕
                        </button>
                    </div>
                ) : (
                    <div style={{ fontSize: 9, color: "#2a4a5a" }}>Click any feature to inspect.</div>
                )}
            </section>

            <div style={{ padding: "8px 14px", borderTop: "1px solid #0a1e33", fontSize: 9, color: "#2a5a7a", lineHeight: 1.8, flexShrink: 0 }}>
                <div>LAYERS: {Object.values(layers).filter(Boolean).length}/{LAYER_DEFS.length}</div>
                <div>EQ: {earthquakes.length} · EONET: {eonet.length} · BASES: {baseCount}</div>
            </div>
        </div>
    );
}

function LayerToggle({ ld, active, onToggle }: { ld: typeof LAYER_DEFS[0]; active: boolean; onToggle: () => void }) {
    return (
        <div onClick={onToggle}
             style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 8px", borderRadius: 4, marginBottom: 2, cursor: "pointer", background: active ? "rgba(56,189,248,0.05)" : "transparent", border: `1px solid ${active ? "#1a4060" : "transparent"}` }}>
            <div style={{ width: 14, height: 14, borderRadius: 2, border: `2px solid ${active ? ld.color : "#2a4a5a"}`, background: active ? ld.color + "33" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {active && <div style={{ width: 6, height: 6, background: ld.color, borderRadius: 1 }} />}
            </div>
            <span style={{ fontSize: 10, color: active ? "#c8d8e8" : "#4a6a7a", letterSpacing: "0.06em" }}>{ld.label}</span>
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 13, opacity: 0.6 }}>{ld.icon}</span>
        </div>
    );
}