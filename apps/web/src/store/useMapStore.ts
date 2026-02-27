import { create } from "zustand";
import type { LayerId } from "../constants/layers";

export interface SelectedFeature {
    name: string;
    [key: string]: string | number | undefined;
}

export interface TooltipState {
    x: number;
    y: number;
    content: string;
    sub?: string;
    type: "base" | "cable" | "country" | "earthquake" | "eonet";
    color?: string;
}

interface MapStore {
    // Layer visibility
    layers: Record<LayerId, boolean>;
    toggleLayer: (id: LayerId) => void;

    // Selection & tooltip
    selected: SelectedFeature | null;
    setSelected: (f: SelectedFeature | null) => void;
    tooltip: TooltipState | null;
    setTooltip: (t: TooltipState | null) => void;

    // UI panels
    sidebarOpen: boolean;
    setSidebarOpen: (v: boolean) => void;
    economicPanelOpen: boolean;
    setEconomicPanelOpen: (v: boolean) => void;

    // Filters
    filterBranch: string;
    setFilterBranch: (b: string) => void;
    minMagnitude: number;
    setMinMagnitude: (m: number) => void;
    eonetCategories: Set<string>;
    toggleEonetCategory: (c: string) => void;

    // Cursor
    cursorPos: { lat: number; lon: number };
    setCursorPos: (p: { lat: number; lon: number }) => void;
}

export const useMapStore = create<MapStore>((set) => ({
    layers: {
        graticule:   true,
        countries:   true,
        cables:      true,
        bases:       true,
        earthquakes: true,
        eonet:       true,
    },
    toggleLayer: (id) =>
        set((s) => ({ layers: { ...s.layers, [id]: !s.layers[id] } })),

    selected: null,
    setSelected: (selected) => set({ selected }),
    tooltip: null,
    setTooltip: (tooltip) => set({ tooltip }),

    sidebarOpen: true,
    setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
    economicPanelOpen: false,
    setEconomicPanelOpen: (economicPanelOpen) => set({ economicPanelOpen }),

    filterBranch: "ALL",
    setFilterBranch: (filterBranch) => set({ filterBranch }),
    minMagnitude: 4.0,
    setMinMagnitude: (minMagnitude) => set({ minMagnitude }),
    eonetCategories: new Set(["Wildfires", "Severe Storms", "Volcanoes", "Floods", "Drought", "Dust and Haze", "Landslides", "Sea and Lake Ice", "Snow", "Earthquakes"]),
    toggleEonetCategory: (c) =>
        set((s) => {
            const next = new Set(s.eonetCategories);
            next.has(c) ? next.delete(c) : next.add(c);
            return { eonetCategories: next };
        }),

    cursorPos: { lat: 0, lon: 0 },
    setCursorPos: (cursorPos) => set({ cursorPos }),
}));