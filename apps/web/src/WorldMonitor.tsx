import {useRef, useEffect, useState, useMemo} from "react";

import {useWindowSize} from "./hooks/useWindowSize";
import {useProjection} from "./hooks/useProjection";
import {useZoom} from "./hooks/useZoom";
import {useMapDataQueries} from "./hooks/useMapDataQueries";
import {useFilteredData} from "./hooks/useFilteredData";
import {useMapCursorTracking} from "./hooks/useMapCursorTracking";
import {useDataStatusMapping} from "./hooks/useDataStatusMapping";
// Week 3 — SSE hook stays separate (not a TanStack query)
import {useFlightStream} from "./hooks/useFlightData";
import {useConflictHotspots, useConflictEvents} from "./hooks/useConflictData";
import {useMapStore} from "./store/useMapStore";

import {TopBar} from "./components/TopBar";
import {Sidebar} from "./components/Sidebar";
import {ZoomControls} from "./components/ZoomControls";
import {StatusBar} from "./components/StatusBar";
import {LoadingOverlay} from "./components/LoadingOverlay";
import {MapTooltip} from "./components/MapTooltip";
import {EconomicPanel} from "./components/EconomicPanel";
import {ConflictPanel} from "./components/ConflictPanel";

import {MapLayers} from "./components/MapLayers";

const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #03080f; }
  ::-webkit-scrollbar-thumb { background: #1a3a5c; border-radius: 2px; }
  .country-path { transition: fill 0.15s; cursor: pointer; }
  .country-path:hover { fill: rgba(56,189,248,0.15) !important; }
  @keyframes scan  { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
  @keyframes blink { 0%,49%{opacity:1} 50%,100%{opacity:0} }
  .scan-line { animation: scan 8s linear infinite; pointer-events: none; }
  input[type=range] { height: 3px; cursor: pointer; }
`;

const SIDEBAR_W = 280;
const TOPBAR_H = 48;

export default function WorldMonitor() {
    const svgRef = useRef<SVGSVGElement>(null);
    const [winW, winH] = useWindowSize();
    const [tick, setTick] = useState(0);

    const {sidebarOpen, layers, tooltip, showMilitaryFlightsOnly} = useMapStore();

    const mapW = winW - (sidebarOpen ? SIDEBAR_W : 0);
    const mapH = winH - TOPBAR_H;

    const {projection, pathGen, graticule, sphere} = useProjection(mapW, mapH);
    const {transform, zoomIn, zoomOut, zoomReset} = useZoom(svgRef.current);

    // ── Week 1 + 2 data ─────────────────────────────────────────────────────────
    const {countries, cables, basesData, quakes, eonetData, statuses} = useMapDataQueries();
    const {
        filteredBases,
        filteredQuakes,
        filteredEONET,
        uniqueBranches
    } = useFilteredData(basesData, quakes, eonetData);
    const {handleMouseMove} = useMapCursorTracking(svgRef, projection, transform);
    const dataStatus = useDataStatusMapping(statuses);

    // ── Week 3: flights (SSE) + conflict ────────────────────────────────────────
    const {aircraft} = useFlightStream();
    const {data: hotspots, status: hStatus} = useConflictHotspots();
    const {data: conflictEvents} = useConflictEvents();

    const filteredAircraft = useMemo(() =>
            showMilitaryFlightsOnly
                ? aircraft.filter((a) => a.isMilitary)
                : aircraft,
        [aircraft, showMilitaryFlightsOnly]
    );

    // Merge week 3 conflict status into the existing dataStatus object
    const fullStatus = {
        ...dataStatus,
        conflict: hStatus === "success" ? "ok" : hStatus === "error" ? "error" : "loading",
    };

    // ── Tick for pulsing ────────────────────────────────────────────────────────
    useEffect(() => {
        const id = setInterval(() => setTick((t) => t + 1), 1000);
        return () => clearInterval(id);
    }, []);


    // ── Render ───────────────────────────────────────────────────────────────────
    return (
        <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            background: "#03080f",
            color: "#94b8d4",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
        }}>
            <style>{GLOBAL_STYLES}</style>

            <TopBar
                status={fullStatus}
                baseCount={filteredBases.length}
                cableCount={cables?.features?.length ?? "…"}
                nationCount={countries?.features?.length ?? "…"}
                quakeCount={filteredQuakes.length}
            />

            <div style={{flex: 1, display: "flex", overflow: "hidden"}}>
                {sidebarOpen && (
                    <Sidebar
                        uniqueBranches={uniqueBranches}
                        baseCount={filteredBases.length}
                        earthquakes={filteredQuakes}
                        eonet={filteredEONET}
                    />
                )}

                {/* ── Map canvas ── */}
                <div style={{flex: 1, position: "relative", overflow: "hidden", background: "#03080f"}}>
                    <div className="scan-line" style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 2,
                        background: "linear-gradient(90deg, transparent, rgba(56,189,248,0.07), transparent)",
                        zIndex: 10
                    }}/>

                    <svg
                        ref={svgRef}
                        width={mapW}
                        height={mapH}
                        style={{display: "block", cursor: "grab"}}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={() => useMapStore.getState().setTooltip(null)}
                    >
                        <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>
                            <MapLayers
                                pathGen={pathGen as (geo: unknown) => string | null}
                                graticule={graticule}
                                sphere={sphere as GeoJSON.Geometry}
                                countries={countries}
                                cables={cables}
                                basesData={basesData}
                                quakes={quakes ?? []}
                                eonetData={eonetData ?? []}
                                filteredBases={filteredBases}
                                filteredQuakes={filteredQuakes}
                                filteredEONET={filteredEONET}
                                hotspots={hotspots ?? []}
                                conflictEvents={conflictEvents ?? []}
                                filteredAircraft={filteredAircraft}
                                projection={projection}
                                svgRef={svgRef}
                                scale={transform.k}
                                tick={tick}
                            />
                        </g>
                    </svg>

                    <ZoomControls onZoomIn={zoomIn} onZoomOut={zoomOut} onReset={zoomReset}/>

                    <StatusBar
                        scale={transform.k}
                        cableCount={cables?.features?.length ?? "…"}
                        nationCount={countries?.features?.length ?? "…"}
                    />

                    <LoadingOverlay entries={[
                        {label: "Countries", status: fullStatus.countries},
                        {label: "Cables", status: fullStatus.cables},
                        {label: "Bases", status: fullStatus.bases},
                        {label: "Earthquakes", status: fullStatus.earthquakes},
                        {label: "EONET", status: fullStatus.eonet},
                        {label: "Conflict", status: fullStatus.conflict},
                    ]}/>

                    {/* ── Slide-in panels — only one open at a time (enforced in TopBar) ── */}
                    <EconomicPanel/>
                    <ConflictPanel/>
                </div>
            </div>
        </div>
    );
}