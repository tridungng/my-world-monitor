import type {FastifyInstance} from "fastify";
import type {Earthquake, EONETEvent} from "@worldmonitor/types";
import {getOrFetch} from "../lib/cache.js";

const TTL_QUAKES = 60_000;       // 1 min — high-frequency updates
const TTL_EONET = 5 * 60_000;   // 5 min

// ─── USGS Earthquakes ─────────────────────────────────────────────────────────

async function fetchEarthquakes(): Promise<Earthquake[]> {
    const url = new URL("https://earthquake.usgs.gov/fdsnws/event/1/query");
    url.searchParams.set("format", "geojson");
    url.searchParams.set("limit", "300");
    url.searchParams.set("minmagnitude", "4.0");
    url.searchParams.set("orderby", "time");

    const res = await fetch(url.toString());
    const json = await res.json() as { features: USGSFeature[] };

    return json.features.map((f) => ({
        id: f.id,
        mag: f.properties.mag,
        place: f.properties.place,
        time: f.properties.time,
        depth: f.geometry.coordinates[2],
        lat: f.geometry.coordinates[1],
        lon: f.geometry.coordinates[0],
        url: f.properties.url,
        status: f.properties.status,
        tsunami: f.properties.tsunami,
    }));
}

interface USGSFeature {
    id: string;
    properties: {
        mag: number;
        place: string;
        time: number;
        url: string;
        status: string;
        tsunami: number;
    };
    geometry: { coordinates: [number, number, number] };
}

// ─── NASA EONET ───────────────────────────────────────────────────────────────

async function fetchEONET(): Promise<EONETEvent[]> {
    const url = "https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=100&days=30";
    const res = await fetch(url);
    const json = await res.json() as { events: EONETRaw[] };

    const events: EONETEvent[] = [];
    console.log('json', json);
    for (const ev of json.events) {
        const geo = ev.geometry.at(-1); // most recent geometry entry
        if (!geo || geo.type !== "Point") continue;
        events.push({
            id: ev.id,
            title: ev.title,
            category: ev.categories[0]?.title ?? "Unknown",
            date: geo.date,
            lat: geo.coordinates[1],
            lon: geo.coordinates[0],
            closed: ev.closed ?? null,
        });
    }
    return events;
}

interface EONETRaw {
    id: string;
    title: string;
    closed?: string;
    categories: { id: string; title: string }[];
    geometry: {
        date: string;
        type: string;
        coordinates: [number, number];
    }[];
}

// ─── Route registration ───────────────────────────────────────────────────────

export async function disasterRoutes(app: FastifyInstance) {
    app.get("/api/disasters/earthquakes", async () =>
        getOrFetch("earthquakes", TTL_QUAKES, fetchEarthquakes)
    );

    app.get("/api/disasters/eonet", async () =>
        getOrFetch("eonet", TTL_EONET, fetchEONET)
    );
}