import type { Earthquake, EONETEvent } from "@worldmonitor/types";
import { depthColor, eonetStyle } from "../constants/layers";
import { useMapStore } from "../store/useMapStore";

type FeedEvent =
    | { kind: "quake"; data: Earthquake }
    | { kind: "eonet"; data: EONETEvent };

interface Props {
    earthquakes: Earthquake[];
    eonet: EONETEvent[];
}

function timeAgo(ms: number) {
    const diff = Date.now() - ms;
    const m = Math.floor(diff / 60_000);
    if (m < 60)  return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24)  return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

export function DisasterFeed({ earthquakes, eonet }: Props) {
    const { setSelected } = useMapStore();

    // Merge + sort by time desc, take top 12
    const quakeEvents: FeedEvent[] = earthquakes
        .slice(0, 20)
        .map((q) => ({ kind: "quake" as const, data: q }));

    const eonetEvents: FeedEvent[] = eonet
        .map((e) => ({ kind: "eonet" as const, data: e }));

    const merged: FeedEvent[] = [
        ...quakeEvents,
        ...eonetEvents,
    ]
        .sort((a, b) => {
            const ta = a.kind === "quake" ? a.data.time : new Date(a.data.date).getTime();
            const tb = b.kind === "quake" ? b.data.time : new Date(b.data.date).getTime();
            return tb - ta;
        })
        .slice(0, 15);

    return (
        <section style={{ borderBottom: "1px solid #0a1e33" }}>
            <div style={{ padding: "10px 14px 6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 9, letterSpacing: "0.15em", color: "#2a5a7a" }}>LIVE EVENTS</div>
                <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ fontSize: 8, color: "#ff6b35" }}>⬤ {earthquakes.length} EQ</span>
                    <span style={{ fontSize: 8, color: "#ff4d6d" }}>◈ {eonet.length} EONET</span>
                </div>
            </div>

            <div style={{ maxHeight: 100, overflowY: "auto" }}>
                {merged.length === 0 && (
                    <div style={{ padding: "8px 14px", fontSize: 9, color: "#2a4a5a" }}>Loading events…</div>
                )}
                {merged.map((ev, i) => {
                    if (ev.kind === "quake") {
                        const q     = ev.data;
                        const color = depthColor(q.depth);
                        return (
                            <div
                                key={`q-${q.id}`}
                                onClick={() => setSelected({ name: q.place, magnitude: q.mag, depth: `${q.depth.toFixed(0)} km`, time: new Date(q.time).toUTCString(), tsunami: q.tsunami ? "⚠ YES" : "None", lat: q.lat, lon: q.lon })}
                                style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "5px 14px", cursor: "pointer", borderBottom: "1px solid #050e1a" }}
                            >
                                <div style={{ fontSize: 9, color, fontWeight: 700, minWidth: 28, marginTop: 1 }}>M{q.mag.toFixed(1)}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 9, color: "#94b8d4", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.place}</div>
                                    <div style={{ fontSize: 8, color: "#2a5a7a" }}>{q.depth.toFixed(0)}km · {timeAgo(q.time)}</div>
                                </div>
                                {q.tsunami === 1 && <span style={{ fontSize: 9, color: "#f87171" }}>🌊</span>}
                            </div>
                        );
                    } else {
                        const e     = ev.data;
                        const style = eonetStyle(e.category);
                        return (
                            <div
                                key={`e-${e.id}-${i}`}
                                onClick={() => setSelected({ name: e.title, category: e.category, date: new Date(e.date).toUTCString(), status: e.closed ? "Closed" : "ACTIVE", lat: e.lat, lon: e.lon })}
                                style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "5px 14px", cursor: "pointer", borderBottom: "1px solid #050e1a" }}
                            >
                                <div style={{ fontSize: 11, minWidth: 18, marginTop: 1 }}>{style.icon}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 9, color: "#94b8d4", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.title}</div>
                                    <div style={{ fontSize: 8, color: "#2a5a7a" }}>{style.label} · {timeAgo(new Date(e.date).getTime())}</div>
                                </div>
                                {!e.closed && <span style={{ fontSize: 7, color: "#ff4d6d", border: "1px solid #ff4d6d", padding: "1px 3px", borderRadius: 2 }}>LIVE</span>}
                            </div>
                        );
                    }
                })}
            </div>
        </section>
    );
}