import { useRef, useMemo, useEffect, useState, useCallback } from "react";
import * as d3 from "d3";
import type { MilitaryBase } from "@worldmonitor/types";

import { useWindowSize }   from "./hooks/useWindowSize";
import { useProjection }   from "./hooks/useProjection";
import { useZoom }         from "./hooks/useZoom";
import { useCountries, useCables, useBases } from "./hooks/useMapData";
import { useMapStore }     from "./store/useMapStore";

import { TopBar }          from "./components/TopBar";
import { Sidebar }         from "./components/Sidebar";
import { ZoomControls }    from "./components/ZoomControls";
import { StatusBar }       from "./components/StatusBar";
import { LoadingOverlay }  from "./components/LoadingOverlay";
import { MapTooltip }      from "./components/MapTooltip";

import { GraticuleLayer }  from "./layers/GraticuleLayer";
import { CountriesLayer }  from "./layers/CountriesLayer";
import { CablesLayer }     from "./layers/CablesLayer";
import { BasesLayer }      from "./layers/BasesLayer";

const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #03080f; }
  ::-webkit-scrollbar-thumb { background: #1a3a5c; border-radius: 2px; }
  .country-path { transition: fill 0.15s; cursor: pointer; }
  .country-path:hover { fill: rgba(56,189,248,0.15) !important; }
  @keyframes scan { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
  @keyframes blink { 0%,49%{opacity:1} 50%,100%{opacity:0} }
  .scan-line { animation: scan 8s linear infinite; pointer-events: none; }
`;

const SIDEBAR_W = 280;
const TOPBAR_H  = 48;

export default function WorldMonitor() {
  const svgRef   = useRef<SVGSVGElement>(null);
  const [winW, winH] = useWindowSize();
  const [tick, setTick] = useState(0);

  const { sidebarOpen, layers, filterBranch, setCursorPos, tooltip } = useMapStore();

  const mapW = winW - (sidebarOpen ? SIDEBAR_W : 0);
  const mapH = winH - TOPBAR_H;

  const { projection, pathGen, graticule, sphere } = useProjection(mapW, mapH);
  const { transform, zoomIn, zoomOut, zoomReset }  = useZoom(svgRef.current);

  // Data queries — all fetched from local API
  const { data: countries, status: cStatus } = useCountries();
  const { data: cables,    status: bStatus } = useCables();
  const { data: basesData, status: baseStatus } = useBases();

  const allBases: MilitaryBase[] = basesData?.features ?? [];

  const filteredBases = useMemo(() =>
          filterBranch === "ALL" ? allBases : allBases.filter((b) => b.branch === filterBranch),
      [allBases, filterBranch]
  );

  const uniqueBranches = useMemo(() =>
          ["ALL", ...new Set(allBases.map((b) => b.branch))],
      [allBases]
  );

  // Animated tick for pulsing markers
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Cursor lat/lon tracking
  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const ix = transform.invertX(e.clientX - rect.left);
    const iy = transform.invertY(e.clientY - rect.top);
    const coords = projection.invert?.([ix, iy]);
    if (coords) setCursorPos({ lon: parseFloat(coords[0].toFixed(2)), lat: parseFloat(coords[1].toFixed(2)) });
  }, [projection, transform, setCursorPos]);

  const dataStatus = {
    countries: cStatus === "success" ? "ok" : cStatus === "error" ? "error" : "loading",
    cables:    bStatus === "success" ? "ok" : bStatus === "error" ? "error" : "loading",
    bases:     baseStatus === "success" ? "ok" : baseStatus === "error" ? "error" : "loading",
  };

  return (
      <div style={{ fontFamily: "'JetBrains Mono', monospace", background: "#03080f", color: "#94b8d4", height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <style>{GLOBAL_STYLES}</style>

        <TopBar
            status={dataStatus}
            baseCount={filteredBases.length}
            cableCount={cables?.features?.length ?? "…"}
            nationCount={countries?.features?.length ?? "…"}
        />

        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {sidebarOpen && (
              <Sidebar uniqueBranches={uniqueBranches} baseCount={filteredBases.length} />
          )}

          <div style={{ flex: 1, position: "relative", overflow: "hidden", background: "#03080f" }}>
            {/* Scan-line effect */}
            <div className="scan-line" style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, rgba(56,189,248,0.07), transparent)", zIndex: 10 }} />

            {/* SVG Map */}
            <svg
                ref={svgRef}
                width={mapW}
                height={mapH}
                style={{ display: "block", cursor: "grab" }}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => useMapStore.getState().setTooltip(null)}
            >
              <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>

                {/* Always-on: graticule + sphere + SVG defs */}
                <GraticuleLayer
                    pathGen={pathGen as (geo: unknown) => string | null}
                    graticule={graticule}
                    sphere={sphere}
                />

                {/* Graticule grid is part of GraticuleLayer but toggleable */}
                {layers.countries && countries && (
                    <CountriesLayer data={countries} pathGen={pathGen as never} svgRef={svgRef as never} />
                )}

                {layers.cables && cables && (
                    <CablesLayer data={cables} pathGen={pathGen as never} svgRef={svgRef as never} scale={transform.k} />
                )}

                {layers.bases && (
                    <BasesLayer bases={filteredBases} projection={projection} svgRef={svgRef as never} scale={transform.k} tick={tick} />
                )}

                {tooltip && (
                    <MapTooltip tooltip={tooltip} transform={transform} />
                )}
              </g>
            </svg>

            <ZoomControls onZoomIn={zoomIn} onZoomOut={zoomOut} onReset={zoomReset} />
            <StatusBar scale={transform.k} cableCount={cables?.features?.length ?? "…"} nationCount={countries?.features?.length ?? "…"} />
            <LoadingOverlay entries={[
              { label: "Countries", status: dataStatus.countries },
              { label: "Cables",    status: dataStatus.cables },
              { label: "Bases",     status: dataStatus.bases },
            ]} />
          </div>
        </div>
      </div>
  );
}