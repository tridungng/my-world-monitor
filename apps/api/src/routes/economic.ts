import type { FastifyInstance } from "fastify";
import type { FREDSeries, EconomicSeriesId } from "@worldmonitor/types";
import { getOrFetch } from "../lib/cache.js";

const TTL_FRED = 60 * 60_000; // 1 hour

// Series metadata
const SERIES_META: Record<EconomicSeriesId, { title: string; units: string; frequency: string }> = {
    UNRATE:     { title: "Unemployment Rate",          units: "%",    frequency: "Monthly" },
    CPIAUCSL:   { title: "CPI (Inflation Index)",      units: "Index",frequency: "Monthly" },
    FEDFUNDS:   { title: "Federal Funds Rate",         units: "%",    frequency: "Monthly" },
    DCOILWTICO: { title: "WTI Crude Oil Price",        units: "$/bbl",frequency: "Daily"   },
    T10Y2Y:     { title: "10yr-2yr Treasury Spread",   units: "%",    frequency: "Daily"   },
};

const ALL_SERIES: EconomicSeriesId[] = ["UNRATE", "CPIAUCSL", "FEDFUNDS", "DCOILWTICO", "T10Y2Y"];

// ─── FRED fetcher ─────────────────────────────────────────────────────────────

async function fetchFREDSeries(seriesId: EconomicSeriesId, apiKey: string): Promise<FREDSeries> {
    const url = new URL("https://api.stlouisfed.org/fred/series/observations");
    url.searchParams.set("series_id",   seriesId);
    url.searchParams.set("api_key",     apiKey);
    url.searchParams.set("file_type",   "json");
    url.searchParams.set("limit",       "36");   // ~3 years monthly / ~6 weeks daily
    url.searchParams.set("sort_order",  "desc");
    url.searchParams.set("observation_start", "2020-01-01");

    const res  = await fetch(url.toString());
    if (!res.ok) throw new Error(`FRED ${seriesId} returned ${res.status}`);

    const json = await res.json() as {
        observations: { date: string; value: string }[]
    };

    const meta = SERIES_META[seriesId];
    return {
        id:        seriesId,
        title:     meta.title,
        units:     meta.units,
        frequency: meta.frequency,
        observations: json.observations
            .map((o) => ({ date: o.date, value: o.value === "." ? null : parseFloat(o.value) }))
            .reverse(), // ascending for charts
    };
}

// ─── Demo data (shown when FRED_API_KEY is not set) ───────────────────────────

function buildDemoSeries(id: EconomicSeriesId): FREDSeries {
    const meta = SERIES_META[id];
    const demos: Record<EconomicSeriesId, number[]> = {
        UNRATE:     [3.5,3.4,3.5,3.7,3.9,4.0,4.1,3.9,3.8,3.7,4.2,4.3],
        CPIAUCSL:   [296,297,299,301,302,303,305,306,307,308,309,310],
        FEDFUNDS:   [4.33,4.33,5.08,5.33,5.33,5.33,5.33,5.33,5.08,4.83,4.58,4.33],
        DCOILWTICO: [72,76,81,85,78,83,88,92,80,74,68,72],
        T10Y2Y:     [-1.0,-0.9,-0.8,-0.7,-0.5,-0.3,-0.1,0.1,0.2,0.3,0.2,0.1],
    };
    const now = new Date();
    return {
        id,
        title:     meta.title,
        units:     meta.units,
        frequency: meta.frequency,
        isDemo:    true,
        observations: demos[id].map((value, i) => {
            const d = new Date(now);
            d.setMonth(d.getMonth() - (demos[id].length - 1 - i));
            return { date: d.toISOString().slice(0, 10), value };
        }),
    };
}

// ─── Route registration ───────────────────────────────────────────────────────

export async function economicRoutes(app: FastifyInstance) {
    app.get("/api/economic/indicators", async () => {
        const apiKey = process.env.FRED_API_KEY;

        if (!apiKey) {
            // Return demo data so charts still render — clearly flagged
            return ALL_SERIES.map(buildDemoSeries);
        }

        return getOrFetch("fred_all", TTL_FRED, () =>
            Promise.all(ALL_SERIES.map((id) => fetchFREDSeries(id, apiKey)))
        );
    });

    // Individual series endpoint for future drill-down
    app.get<{ Params: { id: string } }>("/api/economic/series/:id", async (req, reply) => {
        const id = req.params.id as EconomicSeriesId;
        if (!ALL_SERIES.includes(id)) return reply.status(400).send({ error: "Unknown series" });

        const apiKey = process.env.FRED_API_KEY;
        if (!apiKey) return buildDemoSeries(id);

        return getOrFetch(`fred_${id}`, TTL_FRED, () => fetchFREDSeries(id, apiKey));
    });
}