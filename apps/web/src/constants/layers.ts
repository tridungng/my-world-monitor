export type LayerId = "graticule" | "countries" | "cables" | "bases" | "earthquakes" | "eonet";

export interface LayerDef {
    id: LayerId;
    label: string;
    color: string;
    icon: string;
    category: "static" | "live";
}

export const LAYER_DEFS: LayerDef[] = [
    { id: "graticule",   label: "Grid / Graticule",   color: "#1e3a5f", icon: "⊞", category: "static" },
    { id: "countries",   label: "Country Borders",    color: "#1e5a8f", icon: "🗺", category: "static" },
    { id: "cables",      label: "Submarine Cables",   color: "#f59e0b", icon: "〜", category: "static" },
    { id: "bases",       label: "Military Bases",     color: "#38bdf8", icon: "✦", category: "static" },
    { id: "earthquakes", label: "Earthquakes",        color: "#ff6b35", icon: "⬤", category: "live"   },
    { id: "eonet",       label: "EONET Events",       color: "#ff4d6d", icon: "◈", category: "live"   },
];

export const CABLE_COLORS = [
    "#f59e0b","#38bdf8","#818cf8","#34d399",
    "#f87171","#fb923c","#c084fc","#67e8f9",
];

export const BRANCH_COLORS: Record<string, string> = {
    USAF:      "#38bdf8",
    USA:       "#34d399",
    USN:       "#818cf8",
    USMC:      "#fb923c",
    RUAF:      "#f87171",
    RUN:       "#f87171",
    PLA:       "#facc15",
    NATO:      "#c084fc",
    NSA:       "#94a3b8",
    "CIA/NSA": "#94a3b8",
    "RU/SYR":  "#f87171",
    UAE:       "#fbbf24",
    RAN:       "#67e8f9",
};

// Earthquake depth → color bands
export function depthColor(depth: number): string {
    if (depth < 10)  return "#ff2200"; // very shallow — most destructive
    if (depth < 30)  return "#ff6b35";
    if (depth < 70)  return "#f59e0b";
    if (depth < 150) return "#facc15";
    return "#94a3b8";                  // deep — less surface impact
}

// Mag → circle radius (px, unscaled)
export function magRadius(mag: number): number {
    return Math.max(2, Math.pow(2, mag * 0.45) * 0.9);
}

// EONET category styling
export interface EONETStyle { color: string; icon: string; label: string }

export const EONET_STYLES: Record<string, EONETStyle> = {
    "Wildfires":         { color: "#ff4d00", icon: "🔥", label: "Wildfire"   },
    "Severe Storms":     { color: "#818cf8", icon: "⛈",  label: "Storm"     },
    "Volcanoes":         { color: "#ff6b35", icon: "🌋", label: "Volcano"   },
    "Sea and Lake Ice":  { color: "#67e8f9", icon: "❄",  label: "Ice"       },
    "Floods":            { color: "#38bdf8", icon: "💧", label: "Flood"     },
    "Drought":           { color: "#f59e0b", icon: "☀",  label: "Drought"   },
    "Dust and Haze":     { color: "#d4a574", icon: "🌫", label: "Dust/Haze" },
    "Landslides":        { color: "#8b5e3c", icon: "⛰",  label: "Landslide" },
    "Snow":              { color: "#e2f0ff", icon: "❄",  label: "Snow"      },
    "Earthquakes":       { color: "#ff6b35", icon: "⬤", label: "Earthquake" },
    "default":           { color: "#94a3b8", icon: "◎",  label: "Event"     },
};

export function eonetStyle(category: string): EONETStyle {
    return EONET_STYLES[category] ?? EONET_STYLES["default"];
}