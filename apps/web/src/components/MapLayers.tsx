import type {GeoProjection} from "d3";

import {useMapStore} from "../store/useMapStore";
import {GraticuleLayer} from "../layers/GraticuleLayer";
import {CountriesLayer} from "../layers/CountriesLayer";
import {CablesLayer} from "../layers/CablesLayer";
import {BasesLayer} from "../layers/BasesLayer";
import {EarthquakeLayer} from "../layers/EarthquakeLayer";
import {ENONETLayer} from "../layers/ENONETLayer";
import {FlightsLayer} from "../layers/FlightsLayer";
import {ConflictLayer} from "../layers/ConflictLayer";
import {MapTooltip} from "./MapTooltip";
import {Earthquake, EONETEvent} from "@worldmonitor/types";

interface MapLayersProps {
    pathGen: (geo: unknown) => string | null;
    graticule: unknown;
    sphere: any;
    countries: any;
    cables: any;
    basesData: any;
    quakes: any[] | Earthquake[];
    eonetData: any[] | EONETEvent[];
    filteredBases: any[];
    filteredQuakes: any[];
    filteredEONET: any[];
    hotspots: any[];
    conflictEvents: any[];
    filteredAircraft: any[];
    projection: GeoProjection;
    svgRef: React.RefObject<SVGSVGElement>;
    scale: number;
    tick: number;
}

export function MapLayers({
                              pathGen,
                              graticule,
                              sphere,
                              countries,
                              cables,
                              filteredBases,
                              filteredQuakes,
                              filteredEONET,
                              hotspots,
                              conflictEvents,
                              filteredAircraft,
                              projection,
                              svgRef,
                              scale,
                              tick,
                          }: MapLayersProps) {
    const {layers, tooltip} = useMapStore();

    return (
        <>
            {/* Sphere + defs always rendered (required by other layers) */}
            <GraticuleLayer
                pathGen={pathGen as (geo: unknown) => string | null}
                graticule={graticule as any}
                sphere={sphere as any}
            />

            {layers.countries && countries && (
                <CountriesLayer data={countries} pathGen={pathGen as never} svgRef={svgRef as never}/>
            )}

            {layers.cables && cables && (
                <CablesLayer data={cables} pathGen={pathGen as never} svgRef={svgRef as never} scale={scale}/>
            )}

            {/* Week 3 — conflict zones (behind disaster + flight layers) */}
            {layers.conflict && (hotspots || conflictEvents) && (
                <ConflictLayer
                    hotspots={hotspots ?? []}
                    events={conflictEvents ?? []}
                    projection={projection}
                    svgRef={svgRef as never}
                    scale={scale}
                    tick={tick}
                />
            )}

            {/* Week 2: disaster layers beneath bases */}
            {layers.earthquakes && filteredQuakes.length > 0 && (
                <EarthquakeLayer
                    quakes={filteredQuakes}
                    projection={projection}
                    svgRef={svgRef as never}
                    scale={scale}
                />
            )}

            {layers.eonet && filteredEONET.length > 0 && (
                <ENONETLayer
                    events={filteredEONET}
                    projection={projection}
                    svgRef={svgRef as never}
                    scale={scale}
                />
            )}

            {/* Week 3 — live flights (above disasters, below bases) */}
            {layers.flights && filteredAircraft.length > 0 && (
                <FlightsLayer aircraft={filteredAircraft} projection={projection} svgRef={svgRef as never}
                              scale={scale}/>
            )}

            {/* Bases on top */}
            {layers.bases && (
                <BasesLayer
                    bases={filteredBases}
                    projection={projection}
                    svgRef={svgRef as never}
                    scale={scale}
                    tick={tick}
                />
            )}

            {tooltip && <MapTooltip tooltip={tooltip} transform={{x: 0, y: 0, k: 1}}/>}
        </>
    );
}

