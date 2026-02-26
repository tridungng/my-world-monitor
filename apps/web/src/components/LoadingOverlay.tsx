interface StatusEntry { label: string; status: string }

interface Props {
    entries: StatusEntry[];
}

export function LoadingOverlay({ entries }: Props) {
    const allDone = entries.every((e) => e.status === "ok");
    if (allDone) return null;

    return (
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "#040c18", border: "1px solid #1a3a5c", padding: "16px 24px", borderRadius: 4, textAlign: "center", pointerEvents: "none", zIndex: 30 }}>
            <div style={{ fontSize: 11, color: "#38bdf8", marginBottom: 8, letterSpacing: "0.1em" }}>
                INITIALIZING DATA LAYERS
            </div>
            {entries.map(({ label, status }) => (
                <div key={label} style={{ display: "flex", gap: 10, alignItems: "center", padding: "3px 0" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: status === "ok" ? "#00ff88" : status === "error" ? "#ff4444" : "#f59e0b" }} />
                    <span style={{ fontSize: 9, color: "#4a7a8a" }}>{label}</span>
                    <span style={{ fontSize: 9, color: status === "ok" ? "#00ff88" : status === "error" ? "#ff4444" : "#f59e0b" }}>
            {status.toUpperCase()}
          </span>
                </div>
            ))}
        </div>
    );
}