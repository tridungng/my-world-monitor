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

// ─── Disasters ────────────────────────────────────────────────────────────────

export interface Earthquake {
    id: string;
    mag: number;
    place: string;
    time: number;       // unix ms
    depth: number;      // km
    lat: number;
    lon: number;
    url: string;
    status: string;
    tsunami: number;
}

export type EONETCategory =
    | "Wildfires"
    | "Severe Storms"
    | "Volcanoes"
    | "Sea and Lake Ice"
    | "Floods"
    | "Drought"
    | "Dust and Haze"
    | "Landslides"
    | "Snow"
    | "Earthquakes"
    | string;

export interface EONETEvent {
    id: string;
    title: string;
    category: EONETCategory;
    date: string;       // ISO
    lat: number;
    lon: number;
    closed: string | null;
}

// ─── Economic ────────────────────────────────────────────────────────────────

export interface FREDObservation {
    date: string;       // "YYYY-MM-DD"
    value: number | null;
}

export interface FREDSeries {
    id: string;
    title: string;
    units: string;
    frequency: string;
    observations: FREDObservation[];
    isDemo?: boolean;   // true when no API key is set
}

export type EconomicSeriesId =
    | "UNRATE"       // Unemployment Rate
    | "CPIAUCSL"     // CPI Inflation
    | "FEDFUNDS"     // Federal Funds Rate
    | "DCOILWTICO"   // WTI Crude Oil
    | "T10Y2Y";      // 10-2yr Treasury Spread (recession indicator)

// ─── Flights ─────────────────────────────────────────────────────────────────

export interface Aircraft {
    icao24: string;   // unique transponder ID
    callsign: string;
    origin_country: string;
    lat: number;
    lon: number;
    altitude: number;   // metres
    velocity: number;   // m/s
    heading: number;   // 0-360 degrees
    vertical_rate: number;   // m/s, positive = climbing
    on_ground: boolean;
    isMilitary: boolean;
    squawk: string;   // transponder squawk code
}

export interface FlightSnapshot {
    time: number;         // unix seconds
    count: number;
    aircraft: Aircraft[];
}

// ─── Conflict ────────────────────────────────────────────────────────────────

export type ConflictType =
    | "Battle"
    | "Explosion/Remote violence"
    | "Violence against civilians"
    | "Protests"
    | "Riots"
    | "Strategic development"
    | string;

export interface ConflictEvent {
    id: string;
    type: ConflictType;
    actor1: string;
    actor2: string;
    country: string;
    region: string;
    location: string;
    date: string;         // ISO
    lat: number;
    lon: number;
    fatalities: number;
    notes: string;
    source: "acled" | "gdelt" | "demo";
}

export interface ConflictHotspot {
    id: string;
    name: string;
    country: string;
    lat: number;
    lon: number;
    severity: "critical" | "high" | "medium" | "low";
    activeConflicts: number;
    fatalities30d: number;
    trend: "escalating" | "stable" | "deescalating";
    actors: string[];
    lastEvent: string;
    isDemo?: boolean;
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