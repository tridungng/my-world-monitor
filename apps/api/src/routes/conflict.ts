import type {FastifyInstance} from "fastify";
import type {ConflictEvent, ConflictHotspot, ConflictType} from "@worldmonitor/types";
import {getOrFetch} from "../lib/cache.js";

const TTL_CONFLICT = 30 * 60_000;  // 30 min
const TTL_HOTSPOTS = 60 * 60_000;  // 1 hour

// ─── Demo data — realistic active conflict zones (when no API key) ─────────────

const DEMO_HOTSPOTS: ConflictHotspot[] = [
    {
        id: "ukraine", name: "Ukraine War", country: "Ukraine",
        lat: 49.0, lon: 31.5, severity: "critical",
        activeConflicts: 340, fatalities30d: 2400,
        trend: "escalating",
        actors: ["Ukrainian Armed Forces", "Russian Armed Forces", "Wagner Group"],
        lastEvent: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), isDemo: true,
    },
    {
        id: "gaza", name: "Gaza Conflict", country: "Palestine",
        lat: 31.35, lon: 34.31, severity: "critical",
        activeConflicts: 180, fatalities30d: 3100,
        trend: "stable",
        actors: ["IDF", "Hamas", "Islamic Jihad"],
        lastEvent: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), isDemo: true,
    },
    {
        id: "sudan", name: "Sudan Civil War", country: "Sudan",
        lat: 15.5, lon: 32.5, severity: "critical",
        activeConflicts: 210, fatalities30d: 1800,
        trend: "escalating",
        actors: ["SAF", "RSF (Rapid Support Forces)"],
        lastEvent: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), isDemo: true,
    },
    {
        id: "myanmar", name: "Myanmar Civil War", country: "Myanmar",
        lat: 19.7, lon: 96.1, severity: "high",
        activeConflicts: 90, fatalities30d: 650,
        trend: "escalating",
        actors: ["Tatmadaw (SAC)", "PDF", "KNLA", "TNLA"],
        lastEvent: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), isDemo: true,
    },
    {
        id: "sahel", name: "Sahel Insurgency", country: "Mali/Burkina Faso",
        lat: 13.5, lon: -2.0, severity: "high",
        activeConflicts: 60, fatalities30d: 420,
        trend: "escalating",
        actors: ["JNIM", "ISWAP", "GSIM", "Wagner/Africa Corps"],
        lastEvent: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), isDemo: true,
    },
    {
        id: "somalia", name: "Somalia / Al-Shabaab", country: "Somalia",
        lat: 5.1, lon: 46.2, severity: "high",
        activeConflicts: 45, fatalities30d: 280,
        trend: "stable",
        actors: ["Al-Shabaab", "SNA", "ATMIS"],
        lastEvent: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(), isDemo: true,
    },
    {
        id: "drc", name: "DRC / M23 Conflict", country: "DR Congo",
        lat: -1.6, lon: 29.2, severity: "high",
        activeConflicts: 75, fatalities30d: 490,
        trend: "escalating",
        actors: ["M23", "FARDC", "RDF (Rwanda)"],
        lastEvent: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), isDemo: true,
    },
    {
        id: "haiti", name: "Haiti Gang Violence", country: "Haiti",
        lat: 18.9, lon: -72.3, severity: "high",
        activeConflicts: 30, fatalities30d: 310,
        trend: "stable",
        actors: ["G9 Alliance", "GPEP", "National Police of Haiti"],
        lastEvent: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(), isDemo: true,
    },
    {
        id: "west_bank", name: "West Bank Tensions", country: "Palestine",
        lat: 31.95, lon: 35.3, severity: "medium",
        activeConflicts: 25, fatalities30d: 120,
        trend: "escalating",
        actors: ["IDF", "Palestinian factions"],
        lastEvent: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), isDemo: true,
    },
    {
        id: "ethiopia", name: "Amhara / Oromia Violence", country: "Ethiopia",
        lat: 9.0, lon: 38.7, severity: "medium",
        activeConflicts: 35, fatalities30d: 200,
        trend: "stable",
        actors: ["ENDF", "Amhara Fano", "OLF-OLA"],
        lastEvent: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(), isDemo: true,
    },
    {
        id: "kashmir", name: "Kashmir Insurgency", country: "India/Pakistan",
        lat: 34.0, lon: 74.8, severity: "medium",
        activeConflicts: 15, fatalities30d: 45,
        trend: "stable",
        actors: ["LeT", "JeM", "Indian Army"],
        lastEvent: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), isDemo: true,
    },
    {
        id: "nagorno", name: "South Caucasus Tension", country: "Armenia/Azerbaijan",
        lat: 40.1, lon: 46.9, severity: "low",
        activeConflicts: 5, fatalities30d: 8,
        trend: "deescalating",
        actors: ["Armenian Armed Forces", "Azerbaijani Armed Forces"],
        lastEvent: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), isDemo: true,
    },
    {
        id: "south_china_sea", name: "South China Sea Tensions", country: "Multi-state",
        lat: 12.0, lon: 114.0, severity: "medium",
        activeConflicts: 10, fatalities30d: 0,
        trend: "escalating",
        actors: ["PLAN", "Philippine Navy", "Vietnamese Coast Guard"],
        lastEvent: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(), isDemo: true,
    },
    {
        id: "iraq_syria", name: "Syria / Iraq Instability", country: "Syria",
        lat: 35.0, lon: 38.5, severity: "medium",
        activeConflicts: 25, fatalities30d: 90,
        trend: "stable",
        actors: ["ISIS remnants", "SDF", "SAA", "US forces"],
        lastEvent: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(), isDemo: true,
    },
    {
        id: "mozambique", name: "Mozambique Insurgency", country: "Mozambique",
        lat: -13.2, lon: 38.5, severity: "medium",
        activeConflicts: 20, fatalities30d: 75,
        trend: "deescalating",
        actors: ["ISIS-Mozambique (Ansar al-Sunna)", "FADM", "SADC forces"],
        lastEvent: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(), isDemo: true,
    },
];

// Generate plausible demo events from hotspots
function buildDemoEvents(): ConflictEvent[] {
    const types: ConflictEvent["type"][] = [
        "Battle", "Explosion/Remote violence", "Violence against civilians",
        "Strategic development",
    ];
    const events: ConflictEvent[] = [];
    let counter = 0;

    for (const hs of DEMO_HOTSPOTS) {
        const count = hs.severity === "critical" ? 8 : hs.severity === "high" ? 5 : 3;
        for (let i = 0; i < count; i++) {
            const jitter = (v: number) => v + (Math.random() - 0.5) * 3;
            const hoursAgo = Math.floor(Math.random() * 72);
            events.push({
                id: `demo-${hs.id}-${counter++}`,
                type: types[Math.floor(Math.random() * types.length)],
                actor1: hs.actors[0],
                actor2: hs.actors[1] ?? "Unknown",
                country: hs.country,
                region: hs.name,
                location: hs.name,
                date: new Date(Date.now() - hoursAgo * 3_600_000).toISOString(),
                lat: jitter(hs.lat),
                lon: jitter(hs.lon),
                fatalities: Math.floor(Math.random() * (hs.severity === "critical" ? 30 : 10)),
                notes: `Ongoing ${hs.name.toLowerCase()} activity.`,
                source: "demo",
            });
        }
    }
    return events;
}

// ─── ACLED fetcher ────────────────────────────────────────────────────────────

async function fetchACLED(apiKey: string, email: string): Promise<ConflictEvent[]> {
    const url = new URL("https://api.acleddata.com/acled/read");
    url.searchParams.set("key", apiKey);
    url.searchParams.set("email", email);
    url.searchParams.set("limit", "500");
    url.searchParams.set("fields", "data_id|event_date|event_type|actor1|actor2|country|region|location|latitude|longitude|fatalities|notes");
    url.searchParams.set("event_date", formatDateMinus(30));
    url.searchParams.set("event_date_where", "BETWEEN");
    url.searchParams.set("event_date2", new Date().toISOString().slice(0, 10));

    const res = await fetch(url.toString(), {signal: AbortSignal.timeout(10_000)});
    if (!res.ok) throw new Error(`ACLED ${res.status}`);
    const json = await res.json() as { data: ACLEDRow[] };

    return json.data.map((r) => ({
        id: String(r.data_id),
        type: r.event_type,
        actor1: r.actor1,
        actor2: r.actor2 ?? "",
        country: r.country,
        region: r.region,
        location: r.location,
        date: r.event_date,
        lat: parseFloat(r.latitude),
        lon: parseFloat(r.longitude),
        fatalities: Number(r.fatalities),
        notes: r.notes?.slice(0, 200) ?? "",
        source: "acled" as const,
    }));
}

interface ACLEDRow {
    data_id: string;
    event_date: string;
    event_type: string;
    actor1: string;
    actor2?: string;
    country: string;
    region: string;
    location: string;
    latitude: string;
    longitude: string;
    fatalities: string;
    notes?: string;
}

function formatDateMinus(days: number) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().slice(0, 10);
}

// ─── GDELT fetcher (fallback when no ACLED key) ───────────────────────────────
// Uses GDELT DOC 2.0 article-based event extraction

async function fetchGDELT(): Promise<ConflictEvent[]> {
    // GDELT Events 2.0 — query for CAMEO codes 18-20 (assault, killing, use of force)
    // Returns a TSV we parse into structured events
    const url = new URL("https://api.gdeltproject.org/api/v2/events/search");
    url.searchParams.set("query", "conflict OR battle OR airstrike");
    url.searchParams.set("mode", "pointdata");
    url.searchParams.set("maxrecords", "250");
    url.searchParams.set("timespan", "30d");
    url.searchParams.set("format", "json");

    const res = await fetch(url.toString(), {signal: AbortSignal.timeout(12_000)});
    if (!res.ok) throw new Error(`GDELT ${res.status}`);

    const json = await res.json() as { features?: GDELTFeature[] };
    const features = json.features ?? [];

    return features
        .filter((f) => f.geometry?.coordinates?.length === 2)
        .map((f, i) => ({
            id: `gdelt-${i}`,
            type: "Conflict",
            actor1: f.properties?.Actor1Name as string ?? "Unknown",
            actor2: f.properties?.Actor2Name as string ?? "Unknown",
            country: f.properties?.ActionGeo_CountryCode as string ?? "",
            region: f.properties?.ActionGeo_ADM1Code as string ?? "",
            location: f.properties?.ActionGeo_FullName as string ?? "",
            date: f.properties?.DATEADDED
                ? new Date(String(f.properties.DATEADDED)).toISOString()
                : new Date().toISOString(),
            lat: f.geometry.coordinates[1],
            lon: f.geometry.coordinates[0],
            fatalities: 0,   // GDELT doesn't include fatality counts
            notes: f.properties?.SOURCEURL as string ?? "",
            source: "gdelt" as const,
        }));
}

interface GDELTFeature {
    geometry: { coordinates: [number, number] };
    properties?: Record<string, string | number>;
}

// ─── Hotspot aggregator ───────────────────────────────────────────────────────

function aggregateHotspots(events: ConflictEvent[]): ConflictHotspot[] {
    // Group events within ~200km by country/region and build hotspot summary
    const groups: Record<string, ConflictEvent[]> = {};
    for (const ev of events) {
        const key = `${ev.country}::${ev.region}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(ev);
    }

    return Object.entries(groups)
        .filter(([, evs]) => evs.length >= 3)
        .map(([key, evs]) => {
            const [country, region] = key.split("::");
            const lats = evs.map((e) => e.lat);
            const lons = evs.map((e) => e.lon);
            const total = evs.reduce((s, e) => s + e.fatalities, 0);
            const actors = [...new Set(evs.flatMap((e) => [e.actor1, e.actor2].filter(Boolean)))].slice(0, 4);
            const severity = total > 500 ? "critical" : total > 100 ? "high" : total > 20 ? "medium" : "low";
            return {
                id: `${country}-${region}`.toLowerCase().replace(/\s+/g, "-"),
                name: region || country,
                country,
                lat: lats.reduce((a, b) => a + b, 0) / lats.length,
                lon: lons.reduce((a, b) => a + b, 0) / lons.length,
                severity: severity as ConflictHotspot["severity"],
                activeConflicts: evs.length,
                fatalities30d: total,
                trend: "stable" as const,
                actors,
                lastEvent: evs.sort((a, b) => b.date.localeCompare(a.date))[0].date,
            };
        })
        .sort((a, b) => b.fatalities30d - a.fatalities30d)
        .slice(0, 20);
}

// ─── Route registration ───────────────────────────────────────────────────────

export async function conflictRoutes(app: FastifyInstance) {
    const acledKey = process.env.ACLED_API_KEY;
    const acledEmail = process.env.ACLED_EMAIL;
    const hasACLED = Boolean(acledKey && acledEmail);

    /** Recent conflict events */
    app.get("/api/conflict/events", async (_req, reply) => {
        try {
            if (hasACLED) {
                const events = await getOrFetch("conflict_events", TTL_CONFLICT,
                    () => fetchACLED(acledKey!, acledEmail!)
                );
                return events;
            }
            // Fallback chain: GDELT → demo
            try {
                const events = await getOrFetch("conflict_events_gdelt", TTL_CONFLICT, fetchGDELT);
                return events;
            } catch {
                return buildDemoEvents();
            }
        } catch (err) {
            reply.status(503).send({error: String(err)});
        }
    });

    /** Pre-aggregated conflict hotspots (named zones) */
    app.get("/api/conflict/hotspots", async () => {
        if (hasACLED) {
            return getOrFetch("conflict_hotspots", TTL_HOTSPOTS, async () => {
                const events = await getOrFetch("conflict_events", TTL_CONFLICT,
                    () => fetchACLED(acledKey!, acledEmail!)
                );
                return aggregateHotspots(events);
            });
        }
        // Return curated demo hotspots — always high quality
        return DEMO_HOTSPOTS;
    });

    /** Source metadata */
    app.get("/api/conflict/meta", async () => ({
        source: hasACLED ? "acled" : "demo",
        hasACLED,
        hasGDELT: true,
        lastUpdated: new Date().toISOString(),
    }));
}