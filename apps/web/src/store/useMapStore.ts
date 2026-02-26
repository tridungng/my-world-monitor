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
    type: "base" | "cable" | "country";
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

    // UI
    sidebarOpen: boolean;
    setSidebarOpen: (v: boolean) => void;
    filterBranch: string;
    setFilterBranch: (b: string) => void;
    cursorPos: { lat: number; lon: number };
    setCursorPos: (p: { lat: number; lon: number }) => void;
}

export const useMapStore = create<MapStore>((set) => ({
    layers: { graticule: true, countries: true, cables: true, bases: true },
    toggleLayer: (id) =>
        set((s) => ({ layers: { ...s.layers, [id]: !s.layers[id] } })),

    selected: null,
    setSelected: (selected) => set({ selected }),
    tooltip: null,
    setTooltip: (tooltip) => set({ tooltip }),

    sidebarOpen: true,
    setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
    filterBranch: "ALL",
    setFilterBranch: (filterBranch) => set({ filterBranch }),
    cursorPos: { lat: 0, lon: 0 },
    setCursorPos: (cursorPos) => set({ cursorPos }),
}));