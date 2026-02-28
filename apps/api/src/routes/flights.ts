import type { FastifyInstance } from "fastify";
import type { Aircraft, FlightSnapshot } from "@worldmonitor/types";
import { getOrFetch, set as cacheSet } from "../lib/cache.js";
import { subscribe, broadcast, clientCount } from "../lib/sse.js";

const POLL_INTERVAL_MS = 15_000;  // OpenSky allows ~1 req/10s anon, 1/5s with creds
const CHANNEL = "flights";

// ─── Military callsign patterns ───────────────────────────────────────────────
// Real military callsigns follow known prefix patterns
const MIL_CALLSIGN_PREFIXES = [
    // US
    "RCH","REACH","JAKE","KNIFE","GHOST","DARK","DOOM","HAWK",
    "EAGLE","RANGER","VIGILANT","SPAR","VENUS","VIXEN","IRON",
    "COBRA","VIPER","JOLLY","PEDRO","RAVEN","TALON","SHADOW",
    // NATO
    "NATO","NAEW","AWACS","MAGIC","LOBSTER",
    // UK
    "RRR","ASCOT","TARTAN","SCOTCH","CANUCK",
    // German
    "GFAF","GERMAN",
    // Russian
    "RFF","SQD",
];

// Country keywords that usually indicate state/military aircraft
const MIL_COUNTRIES = [
    "United States", "Russia", "China", "United Kingdom", "France",
    "Germany", "Israel", "Iran", "North Korea", "Turkey",
];

function classifyMilitary(callsign: string, country: string): boolean {
    const cs = callsign.trim().toUpperCase();
    if (!cs) return false;
    if (MIL_CALLSIGN_PREFIXES.some((p) => cs.startsWith(p))) return true;
    // All-numeric squawk patterns used by USAF (7777 = military intercept, etc.)
    return false;
}

// ─── OpenSky fetch ────────────────────────────────────────────────────────────

interface OpenSkyState {
    // [icao24, callsign, origin_country, time_position, last_contact,
    //  longitude, latitude, baro_altitude, on_ground, velocity,
    //  true_track, vertical_rate, sensors, geo_altitude, squawk,
    //  spi, position_source]
    [index: number]: string | number | boolean | null;
}

async function fetchOpenSky(user?: string, pass?: string): Promise<FlightSnapshot> {
    const url = new URL("https://opensky-network.org/api/states/all");
    const headers: Record<string, string> = {};
    if (user && pass) {
        headers["Authorization"] = "Basic " + Buffer.from(`${user}:${pass}`).toString("base64");
    }

    const res = await fetch(url.toString(), { headers, signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`OpenSky ${res.status}: ${res.statusText}`);

    const json = await res.json() as { time: number; states: OpenSkyState[] | null };
    const states = json.states ?? [];

    const aircraft: Aircraft[] = states
        .filter((s) => s[6] !== null && s[5] !== null)   // must have lat/lon
        .map((s) => ({
            icao24:         String(s[0] ?? ""),
            callsign:       String(s[1] ?? "").trim(),
            origin_country: String(s[2] ?? ""),
            lat:            Number(s[6]),
            lon:            Number(s[5]),
            altitude:       Number(s[7] ?? s[13] ?? 0),
            velocity:       Number(s[9] ?? 0),
            heading:        Number(s[10] ?? 0),
            vertical_rate:  Number(s[11] ?? 0),
            on_ground:      Boolean(s[8]),
            squawk:         String(s[14] ?? ""),
            isMilitary:     classifyMilitary(String(s[1] ?? ""), String(s[2] ?? "")),
        }))
        // Exclude on-ground aircraft to reduce noise
        .filter((a) => !a.on_ground);

    return {
        time:     json.time,
        count:    aircraft.length,
        aircraft,
    };
}

// ─── Background poller ────────────────────────────────────────────────────────

let pollerStarted = false;

function startPoller(user?: string, pass?: string) {
    if (pollerStarted) return;
    pollerStarted = true;

    const poll = async () => {
        // Skip if no SSE clients are listening — saves API quota
        if (clientCount(CHANNEL) === 0) return;
        try {
            const snapshot = await fetchOpenSky(user, pass);
            cacheSet("flights_latest", snapshot);
            broadcast<FlightSnapshot>(CHANNEL, "snapshot", snapshot);
        } catch (err) {
            broadcast(CHANNEL, "error", { message: String(err) });
        }
    };

    // Initial fetch
    poll();
    setInterval(poll, POLL_INTERVAL_MS);
}

// ─── Route registration ───────────────────────────────────────────────────────

export async function flightRoutes(app: FastifyInstance) {
    const user = process.env.OPENSKY_USERNAME;
    const pass = process.env.OPENSKY_PASSWORD;

    // Start background poller once on boot
    startPoller(user, pass);

    /** REST snapshot — for initial load or polling fallback */
    app.get("/api/flights/snapshot", async (_req, reply) => {
        try {
            const cached = await getOrFetch<FlightSnapshot>(
                "flights_latest",
                POLL_INTERVAL_MS,
                () => fetchOpenSky(user, pass)
            );
            return cached;
        } catch (err) {
            reply.status(503).send({ error: "OpenSky unavailable", detail: String(err) });
        }
    });

    /** SSE stream — push every 15s */
    app.get("/api/flights/stream", (req, reply) => {
        subscribe(CHANNEL, reply);
        // Send latest cached snapshot immediately on connect
        const latest = (global as Record<string, unknown>)["flights_latest_cache"] as FlightSnapshot | undefined;
        if (latest) {
            reply.raw.write(`event: snapshot\ndata: ${JSON.stringify(latest)}\n\n`);
        }
        // Keep request open
        return new Promise<void>(() => {});
    });

    /** Stats endpoint */
    app.get("/api/flights/stats", async () => ({
        sseClients: clientCount(CHANNEL),
        pollIntervalMs: POLL_INTERVAL_MS,
        authenticated: Boolean(user && pass),
    }));
}