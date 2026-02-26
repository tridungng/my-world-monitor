import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";

const app = Fastify({ logger: { transport: { target: "pino-pretty" } } });

await app.register(cors, {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
});
await app.register(helmet, { contentSecurityPolicy: false });

// ── Health ──────────────────────────────────────────────────────────────────
app.get("/api/health", async () => ({
    status: "ok",
    service: "worldmonitor-api",
    timestamp: new Date().toISOString(),
}));

// ── Proxy: Countries GeoJSON ─────────────────────────────────────────────────
// Caches the Natural Earth GeoJSON so the browser doesn't hit GitHub directly
let countriesCache: unknown = null;
let countriesCachedAt = 0;
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

app.get("/api/layers/countries", async (_req, reply) => {
    const now = Date.now();
    if (countriesCache && now - countriesCachedAt < CACHE_TTL_MS) {
        return reply.send(countriesCache);
    }
    const res = await fetch(
        "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson"
    );
    countriesCache = await res.json();
    countriesCachedAt = now;
    return reply.send(countriesCache);
});

// ── Proxy: Submarine Cables GeoJSON ─────────────────────────────────────────
let cablesCache: unknown = null;
let cablesCachedAt = 0;

app.get("/api/layers/cables", async (_req, reply) => {
    const now = Date.now();
    if (cablesCache && now - cablesCachedAt < CACHE_TTL_MS) {
        return reply.send(cablesCache);
    }
    const res = await fetch(
        "https://raw.githubusercontent.com/lifewinning/submarine-cable-taps/refs/heads/master/data/submarine_cables.geojson"
    );
    cablesCache = await res.json();
    cablesCachedAt = now;
    return reply.send(cablesCache);
});

// ── Military Bases (static for Week 1, DB-backed from Week 3+) ───────────────
app.get("/api/layers/bases", async () => {
    // Re-export the static dataset. In Week 3+ replace with PostGIS query.
    const { MILITARY_BASES } = await import("./data/bases.js");
    return { type: "FeatureCollection", features: MILITARY_BASES };
});

// ── Start ────────────────────────────────────────────────────────────────────
const PORT = Number(process.env.PORT ?? 3001);
await app.listen({ port: PORT, host: "0.0.0.0" });
console.log(`\n  🌍  World Monitor API  →  http://localhost:${PORT}\n`);