// ─── Base Layer Types ──────────────────────────────────────────────────────────

export type LayerCategory =
    | "conflict"
    | "military"
    | "infrastructure"
    | "disasters"
    | "economic"
    | "cyber";

export interface DataLayer {
    id: string;
    label: string;
    category: LayerCategory;
    refreshInterval: number; // ms
    enabled: boolean;
}

// ─── Military ─────────────────────────────────────────────────────────────────

export type MilitaryBranch =
    | "USAF" | "USA" | "USN" | "USMC"
    | "RUAF" | "RUN"
    | "PLA"
    | "NATO" | "NSA" | "CIA/NSA" | "RAN" | "UAE"
    | string;

export type BaseType =
    | "Air Force" | "Army" | "Naval" | "Naval Air" | "Marine"
    | "Nuclear" | "SIGINT" | "Island Base" | "HQ" | "Medical"
    | string;

export interface MilitaryBase {
    id: number;
    name: string;
    country: string;
    branch: MilitaryBranch;
    type: BaseType;
    lat: number;
    lon: number;
    personnel: number;
}

// ─── GeoJSON helpers ──────────────────────────────────────────────────────────

export interface CountryProperties {
    ADMIN: string;
    ISO_A3: string;
    CONTINENT: string;
    ECONOMY: string;
    POP_EST: number;
    GDP_MD_EST: number;
}

export interface CableProperties {
    name: string;
    url: string;
    rfs: string;
    owners: string[];
    landing_points: string[];
}

// ─── API Response wrappers ────────────────────────────────────────────────────

export interface HealthResponse {
    status: "ok" | "degraded";
    service: string;
    timestamp: string;
}

export interface ApiError {
    statusCode: number;
    error: string;
    message: string;
}