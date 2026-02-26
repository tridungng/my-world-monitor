import { useMapStore } from "../store/useMapStore";

interface Props {
    scale: number;
    cableCount: number | string;
    nationCount: number | string;
}

export function StatusBar({ scale, cableCount, nationCount }: Props) {
    const { cursorPos } = useMapStore();
    return (
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 26, background: "#040c18", borderTop: "1px solid #0a1e33", display: "flex", alignItems: "center", padding: "0 12px", gap: 16, fontSize: 9, color: "#2a5a7a", zIndex: 20 }}>
            <span>LAT <span style={{ color: "#38bdf8" }}>{cursorPos.lat}°</span></span>
            <span>LON <span style={{ color: "#38bdf8" }}>{cursorPos.lon}°</span></span>
            <span>ZOOM <span style={{ color: "#38bdf8" }}>{scale.toFixed(2)}×</span></span>
            <div style={{ flex: 1 }} />
            <span style={{ color: "#1a5a3a" }}>{cableCount} CABLES</span>
            <span style={{ color: "#1a4a7a" }}>{nationCount} NATIONS</span>
            <span style={{ color: "#3a5a8a" }}>PROJ: NATURAL EARTH</span>
            <span style={{ color: "#2a4a6a" }}>SRC: LOCAL API</span>
        </div>
    );
}