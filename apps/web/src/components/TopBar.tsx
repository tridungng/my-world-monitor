import { useMapStore } from "../store/useMapStore";

interface DataStatus { countries: string; cables: string }

interface Props {
    status: DataStatus;
    baseCount: number;
    cableCount: number | string;
    nationCount: number | string;
}

export function TopBar({ status, baseCount, cableCount, nationCount }: Props) {
    const { sidebarOpen, setSidebarOpen } = useMapStore();

    return (
        <div style={{ height: 48, background: "#050e1a", borderBottom: "1px solid #0f2a44", display: "flex", alignItems: "center", padding: "0 16px", gap: 16, flexShrink: 0, zIndex: 100 }}>
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{ color: "#38bdf8", padding: "4px 8px", border: "1px solid #1a3a5c", borderRadius: 3, fontSize: 14, background: "transparent", cursor: "pointer" }}
            >
                {sidebarOpen ? "◀" : "▶"}
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00ff88", boxShadow: "0 0 6px #00ff88" }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#e2f0ff", letterSpacing: "0.12em" }}>WORLD MONITOR</span>
                <span style={{ fontSize: 10, color: "#3a6a8a", letterSpacing: "0.08em" }}>v1.0 // WEEK 1</span>
            </div>

            <div style={{ flex: 1 }} />

            {[
                { label: "BASES",   val: baseCount,   color: "#38bdf8" },
                { label: "CABLES",  val: cableCount,  color: "#f59e0b" },
                { label: "NATIONS", val: nationCount, color: "#34d399" },
            ].map((s) => (
                <div key={s.label} style={{ display: "flex", gap: 6, alignItems: "center", background: "#071523", border: "1px solid #0f2a44", padding: "4px 10px", borderRadius: 3 }}>
                    <span style={{ fontSize: 9, color: "#3a6a8a", letterSpacing: "0.1em" }}>{s.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.val}</span>
                </div>
            ))}

            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {Object.entries(status).map(([k, v]) => (
                    <div key={k} style={{ display: "flex", gap: 4, alignItems: "center" }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: v === "ok" ? "#00ff88" : v === "error" ? "#ff4444" : "#f59e0b" }} />
                        <span style={{ fontSize: 9, color: "#3a6a8a" }}>{k.toUpperCase()}</span>
                    </div>
                ))}
            </div>

            <div style={{ fontSize: 10, color: "#3a6a8a", minWidth: 140, textAlign: "right" }}>
                {new Date().toUTCString().slice(0, 25)} UTC
            </div>
        </div>
    );
}