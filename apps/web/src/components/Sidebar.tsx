import { LAYER_DEFS, BRANCH_COLORS } from "../constants/layers";
import { useMapStore } from "../store/useMapStore";

interface Props {
    uniqueBranches: string[];
    baseCount: number;
}

export function Sidebar({ uniqueBranches, baseCount }: Props) {
    const { layers, toggleLayer, selected, setSelected, filterBranch, setFilterBranch } = useMapStore();

    return (
        <div style={{ width: 280, background: "#040c18", borderRight: "1px solid #0f2a44", display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0 }}>

            {/* Layer toggles */}
            <section style={{ padding: "12px 14px 8px", borderBottom: "1px solid #0a1e33" }}>
                <div style={{ fontSize: 9, letterSpacing: "0.15em", color: "#2a5a7a", marginBottom: 8 }}>DATA LAYERS</div>
                {LAYER_DEFS.map((ld) => (
                    <div
                        key={ld.id}
                        onClick={() => toggleLayer(ld.id)}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 8px", borderRadius: 4, marginBottom: 2, cursor: "pointer", background: layers[ld.id] ? "rgba(56,189,248,0.05)" : "transparent", border: `1px solid ${layers[ld.id] ? "#1a4060" : "transparent"}` }}
                    >
                        <div style={{ width: 14, height: 14, borderRadius: 2, border: `2px solid ${layers[ld.id] ? ld.color : "#2a4a5a"}`, background: layers[ld.id] ? ld.color + "33" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {layers[ld.id] && <div style={{ width: 6, height: 6, background: ld.color, borderRadius: 1 }} />}
                        </div>
                        <span style={{ fontSize: 10, color: layers[ld.id] ? "#c8d8e8" : "#4a6a7a", letterSpacing: "0.06em" }}>{ld.label}</span>
                        <div style={{ flex: 1 }} />
                        <span style={{ fontSize: 14, opacity: 0.6 }}>{ld.icon}</span>
                    </div>
                ))}
            </section>

            {/* Branch filter */}
            <section style={{ padding: "10px 14px 8px", borderBottom: "1px solid #0a1e33" }}>
                <div style={{ fontSize: 9, letterSpacing: "0.15em", color: "#2a5a7a", marginBottom: 8 }}>BRANCH FILTER</div>
                <select
                    value={filterBranch}
                    onChange={(e) => setFilterBranch(e.target.value)}
                    style={{ width: "100%", background: "#071523", border: "1px solid #1a3a5c", color: "#94b8d4", padding: "6px 8px", fontSize: 10, borderRadius: 3, letterSpacing: "0.08em" }}
                >
                    {uniqueBranches.map((b) => (
                        <option key={b} value={b}>{b === "ALL" ? "ALL BRANCHES" : b}</option>
                    ))}
                </select>
            </section>

            {/* Branch legend */}
            <section style={{ padding: "10px 14px 8px", borderBottom: "1px solid #0a1e33" }}>
                <div style={{ fontSize: 9, letterSpacing: "0.15em", color: "#2a5a7a", marginBottom: 8 }}>BASE LEGEND</div>
                {Object.entries(BRANCH_COLORS).map(([branch, color]) => (
                    <div key={branch} style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 0" }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, boxShadow: `0 0 4px ${color}` }} />
                        <span style={{ fontSize: 9, color: "#4a7a8a" }}>{branch}</span>
                    </div>
                ))}
            </section>

            {/* Selected feature */}
            <section style={{ padding: "10px 14px", flex: 1, overflow: "auto" }}>
                <div style={{ fontSize: 9, letterSpacing: "0.15em", color: "#2a5a7a", marginBottom: 8 }}>SELECTED OBJECT</div>
                {selected ? (
                    <div style={{ background: "#071523", border: "1px solid #1a3a5c", borderRadius: 4, padding: 10 }}>
                        <div style={{ fontSize: 11, color: "#38bdf8", fontWeight: 700, marginBottom: 6 }}>{selected.name}</div>
                        {Object.entries(selected)
                            .filter(([k]) => k !== "name" && k !== "id")
                            .map(([k, v]) => (
                                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", borderBottom: "1px solid #0a1e33" }}>
                                    <span style={{ fontSize: 9, color: "#2a5a7a", letterSpacing: "0.08em" }}>{k.toUpperCase()}</span>
                                    <span style={{ fontSize: 9, color: "#94b8d4" }}>{String(v)}</span>
                                </div>
                            ))}
                        <button
                            onClick={() => setSelected(null)}
                            style={{ marginTop: 8, fontSize: 9, color: "#3a6a8a", padding: "3px 8px", border: "1px solid #1a3a5c", borderRadius: 2, background: "transparent", cursor: "pointer" }}
                        >
                            CLEAR ✕
                        </button>
                    </div>
                ) : (
                    <div style={{ fontSize: 9, color: "#2a4a5a", padding: "8px 0" }}>
                        Click a base or country<br />to inspect details.
                    </div>
                )}
            </section>

            {/* Footer */}
            <div style={{ padding: "8px 14px", borderTop: "1px solid #0a1e33", fontSize: 9, color: "#2a5a7a", lineHeight: 1.8 }}>
                <div>SYS <span style={{ animation: "blink 1s step-end infinite" }}>▌</span> WEEK 1 ACTIVE</div>
                <div>LAYERS: {Object.values(layers).filter(Boolean).length}/{LAYER_DEFS.length}</div>
                <div>BASES VISIBLE: {baseCount}</div>
            </div>
        </div>
    );
}