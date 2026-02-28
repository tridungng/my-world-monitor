import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import {getOrFetch} from "./lib/cache.js";
import {disasterRoutes} from "./routes/disasters.js";
import {economicRoutes} from "./routes/economic.js";
import {flightRoutes} from "./routes/flights.js";
import {conflictRoutes} from "./routes/conflict.js";

const app = Fastify({logger: {transport: {target: "pino-pretty"}}});

await app.register(cors, {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
});
await app.register(helmet, {contentSecurityPolicy: false});

// ── Health ────────────────────────────────────────────────────────────────────
app.get("/api/health", async () => ({
    status: "ok",
    service: "worldmonitor-api",
    week: 3,
    timestamp: new Date().toISOString(),
}));

// ── Layer: Countries ──────────────────────────────────────────────────────────
app.get("/api/layers/countries", async () =>
    getOrFetch("countries", 60 * 60_000, () =>
        fetch("https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson")
            .then((r) => r.json())
    )
);

// ── Layer: Submarine Cables ───────────────────────────────────────────────────
app.get("/api/layers/cables", async () =>
    getOrFetch("cables", 60 * 60_000, () =>
        fetch("https://raw.githubusercontent.com/lifewinning/submarine-cable-taps/refs/heads/master/data/submarine_cables.geojson")
            .then((r) => r.json())
    )
);

// ── Layer: Military Bases ─────────────────────────────────────────────────────
app.get("/api/layers/bases", async () => {
    const {MILITARY_BASES} = await import("./data/bases.js");
    return {type: "FeatureCollection", features: MILITARY_BASES};
});

// ── Week 2 ────────────────────────────────────────────────────────────────────
await app.register(disasterRoutes);
await app.register(economicRoutes);

// ── Week 3 ────────────────────────────────────────────────────────────────────
await app.register(flightRoutes);
await app.register(conflictRoutes);

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = Number(process.env.PORT ?? 3001);
await app.listen({port: PORT, host: "0.0.0.0"});
console.log(`\n  🌍  World Monitor API  →  http://localhost:${PORT}/api/health\n`);