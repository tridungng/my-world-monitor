export type LayerId = "graticule" | "countries" | "cables" | "bases";

export interface LayerDef {
    id: LayerId;
    label: string;
    color: string;
    icon: string;
}

export const LAYER_DEFS: LayerDef[] = [
    { id: "graticule", label: "Grid / Graticule",  color: "#1e3a5f", icon: "⊞" },
    { id: "countries", label: "Country Borders",   color: "#1e5a8f", icon: "🗺" },
    { id: "cables",    label: "Submarine Cables",  color: "#f59e0b", icon: "〜" },
    { id: "bases",     label: "Military Bases",    color: "#38bdf8", icon: "✦" },
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