import { useRef, useEffect, useState } from "react";

import { useWindowSize }          from "./hooks/useWindowSize";
import { useProjection }          from "./hooks/useProjection";
import { useZoom }                from "./hooks/useZoom";
import { useMapDataQueries }      from "./hooks/useMapDataQueries";
import { useFilteredData }        from "./hooks/useFilteredData";
import { useMapCursorTracking }   from "./hooks/useMapCursorTracking";
import { useDataStatusMapping }   from "./hooks/useDataStatusMapping";
import { useMapStore }            from "./store/useMapStore";

import { TopBar }         from "./components/TopBar";
import { Sidebar }        from "./components/Sidebar";
import { ZoomControls }   from "./components/ZoomControls";
import { StatusBar }      from "./components/StatusBar";
import { LoadingOverlay } from "./components/LoadingOverlay";
import { MapTooltip }     from "./components/MapTooltip";
import { EconomicPanel }  from "./components/EconomicPanel";

import { GraticuleLayer }  from "./layers/GraticuleLayer";
import { CountriesLayer }  from "./layers/CountriesLayer";
import { CablesLayer }     from "./layers/CablesLayer";
import { BasesLayer }      from "./layers/BasesLayer";
import { EarthquakeLayer } from "./layers/EarthquakeLayer";
import { ENONETLayer }      from "./layers/ENONETLayer.tsx";

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
const TOPBAR_H  = 48;

export default function WorldMonitor() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [winW, winH] = useWindowSize();
  const [tick, setTick] = useState(0);

  const { sidebarOpen, layers, tooltip } = useMapStore();

  const mapW = winW - (sidebarOpen ? SIDEBAR_W : 0);
  const mapH = winH - TOPBAR_H;

  const { projection, pathGen, graticule, sphere } = useProjection(mapW, mapH);
  const { transform, zoomIn, zoomOut, zoomReset }  = useZoom(svgRef.current);

  // ── Data queries ────────────────────────────────────────────────────────────
  const { countries, cables, basesData, quakes, eonetData, statuses } = useMapDataQueries();
  const { filteredBases, filteredQuakes, filteredEONET, uniqueBranches } = useFilteredData(basesData, quakes, eonetData);
  const { handleMouseMove } = useMapCursorTracking(svgRef, projection, transform);
  const dataStatus = useDataStatusMapping(statuses);

  // ── Tick for pulsing ────────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);


  // ── Render ───────────────────────────────────────────────────────────────────
  return (
      <div style={{ fontFamily: "'JetBrains Mono', monospace", background: "#03080f", color: "#94b8d4", height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <style>{GLOBAL_STYLES}</style>

        <TopBar
            status={dataStatus}
            baseCount={filteredBases.length}
            cableCount={cables?.features?.length ?? "…"}
            nationCount={countries?.features?.length ?? "…"}
            quakeCount={filteredQuakes.length}
        />

        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {sidebarOpen && (
              <Sidebar
                  uniqueBranches={uniqueBranches}
                  baseCount={filteredBases.length}
                  earthquakes={filteredQuakes}
                  eonet={filteredEONET}
              />
          )}

          {/* ── Map canvas ── */}
          <div style={{ flex: 1, position: "relative", overflow: "hidden", background: "#03080f" }}>
            <div className="scan-line" style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, rgba(56,189,248,0.07), transparent)", zIndex: 10 }} />

            <svg
                ref={svgRef}
                width={mapW}
                height={mapH}
                style={{ display: "block", cursor: "grab" }}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => useMapStore.getState().setTooltip(null)}
            >
              <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>

                {/* Sphere + defs always rendered (required by other layers) */}
                <GraticuleLayer
                    pathGen={pathGen as (geo: unknown) => string | null}
                    graticule={graticule}
                    sphere={sphere as GeoJSON.Geometry}
                />

                {layers.countries && countries && (
                    <CountriesLayer data={countries} pathGen={pathGen as never} svgRef={svgRef as never} />
                )}

                {layers.cables && cables && (
                    <CablesLayer data={cables} pathGen={pathGen as never} svgRef={svgRef as never} scale={transform.k} />
                )}

                {/* ── Week 2: disaster layers beneath bases ── */}
                {layers.earthquakes && filteredQuakes.length > 0 && (
                    <EarthquakeLayer
                        quakes={filteredQuakes}
                        projection={projection}
                        svgRef={svgRef as never}
                        scale={transform.k}
                    />
                )}

                {layers.eonet && filteredEONET.length > 0 && (
                    <ENONETLayer
                        events={filteredEONET}
                        projection={projection}
                        svgRef={svgRef as never}
                        scale={transform.k}
                    />
                )}

                {/* Bases on top */}
                {layers.bases && (
                    <BasesLayer
                        bases={filteredBases}
                        projection={projection}
                        svgRef={svgRef as never}
                        scale={transform.k}
                        tick={tick}
                    />
                )}

                {tooltip && (
                    <MapTooltip tooltip={tooltip} transform={transform} />
                )}
              </g>
            </svg>

            <ZoomControls onZoomIn={zoomIn} onZoomOut={zoomOut} onReset={zoomReset} />

            <StatusBar
                scale={transform.k}
                cableCount={cables?.features?.length ?? "…"}
                nationCount={countries?.features?.length ?? "…"}
            />

            <LoadingOverlay entries={[
              { label: "Countries",   status: dataStatus.countries   },
              { label: "Cables",      status: dataStatus.cables      },
              { label: "Bases",       status: dataStatus.bases       },
              { label: "Earthquakes", status: dataStatus.earthquakes },
              { label: "EONET",       status: dataStatus.eonet       },
            ]} />

            {/* ── Economic panel (absolute, slides in from right) ── */}
            <EconomicPanel />
          </div>
        </div>
      </div>
  );
}
