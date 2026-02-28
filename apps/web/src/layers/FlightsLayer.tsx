import type {GeoProjection} from "d3";
import type {Aircraft} from "@worldmonitor/types";
import {altitudeColor, velocityToKnots, metresToFeet} from "../constants/layers";
import {useMapStore} from "../store/useMapStore";
import {RefObject, MouseEvent} from "react";

interface Props {
    aircraft: Aircraft[];
    projection: GeoProjection;
    svgRef: RefObject<SVGSVGElement>;
    scale: number;
}

interface PlaneSymbolProps {
    x: number;
    y: number;
    heading: number;
    size: number;
    color: string;
    isMilitary: boolean;
}

interface AircraftMarkerProps {
    ac: Aircraft;
    projection: GeoProjection;
    scale: number;
    planeSize: number;
    isSelected: boolean;
    svgRef: RefObject<SVGSVGElement>;
}

// Draw a tiny aircraft-shaped arrow pointing in the heading direction
function PlaneSymbol({x, y, heading, size, color, isMilitary}: PlaneSymbolProps) {
    // Arrow triangle pointing "up" then rotated by heading
    const h = size;
    const w = size * 0.55;
    // Body triangle
    const pts = `0,${-h} ${w * 0.5},${h * 0.6} 0,${h * 0.3} ${-w * 0.5},${h * 0.6}`;

    return (
        <g transform={`translate(${x},${y}) rotate(${heading})`}>
            <polygon
                points={pts}
                fill={color}
                fillOpacity={isMilitary ? 1 : 0.75}
                stroke={isMilitary ? "#fff" : "none"}
                strokeWidth={isMilitary ? 0.3 : 0}
            />
            {/* Wing tips */}
            <line x1={-w} y1={0} x2={w} y2={0} stroke={color} strokeWidth={size * 0.2} strokeOpacity={0.7}/>
            <line x1={-w * 0.35} y1={h * 0.45} x2={w * 0.35} y2={h * 0.45} stroke={color} strokeWidth={size * 0.15}
                  strokeOpacity={0.5}/>
        </g>
    );
}

function AircraftMarker({ac, projection, scale, planeSize, isSelected, svgRef}: AircraftMarkerProps) {
    const {setSelected, setTooltip} = useMapStore();
    const pt = projection([ac.lon, ac.lat]);
    if (!pt) return null;

    const color = ac.isMilitary ? "#f59e0b" : altitudeColor(ac.altitude);

    const handleMouseEnter = (e: MouseEvent<SVGGElement>) => {
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return;
        setTooltip({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            content: ac.callsign || ac.icao24,
            sub: `${ac.origin_country} · ${metresToFeet(ac.altitude).toLocaleString()}ft · ${velocityToKnots(ac.velocity)}kts`,
            type: "flight",
            color,
        });
    };

    const handleClick = () => {
        setSelected({
            name: ac.callsign || ac.icao24,
            icao24: ac.icao24,
            country: ac.origin_country,
            altitude: `${metresToFeet(ac.altitude).toLocaleString()} ft`,
            speed: `${velocityToKnots(ac.velocity)} kts`,
            heading: `${Math.round(ac.heading)}°`,
            vrate: `${ac.vertical_rate > 0 ? "+" : ""}${Math.round(ac.vertical_rate)} m/s`,
            military: ac.isMilitary ? "YES ✦" : "No",
            squawk: ac.squawk || "—",
        });
    };

    return (
        <g
            key={ac.icao24}
            style={{cursor: "pointer"}}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={() => setTooltip(null)}
            onClick={handleClick}
        >
            {/* Selection ring */}
            {isSelected && (
                <circle cx={pt[0]} cy={pt[1]} r={planeSize * 2.2} fill="none" stroke="#fff" strokeWidth={0.5 / scale}
                        strokeOpacity={0.7}/>
            )}
            {/* Military highlight ring */}
            {ac.isMilitary && (
                <circle cx={pt[0]} cy={pt[1]} r={planeSize * 1.8} fill="none" stroke="#f59e0b" strokeWidth={0.4 / scale}
                        strokeOpacity={0.5}/>
            )}
            <PlaneSymbol x={pt[0]} y={pt[1]} heading={ac.heading} size={planeSize} color={color}
                         isMilitary={ac.isMilitary}/>
        </g>
    );
}

export function FlightsLayer({aircraft, projection, svgRef, scale}: Props) {
    const {selected} = useMapStore();

    // Keep plane size stable regardless of zoom — scale inverse
    const planeSize = Math.max(2.5, 5 / scale);

    return (
        <>
            {aircraft.map((ac) => (
                <AircraftMarker
                    key={ac.icao24}
                    ac={ac}
                    projection={projection}
                    scale={scale}
                    planeSize={planeSize}
                    isSelected={selected?.name === (ac.callsign || ac.icao24)}
                    svgRef={svgRef}
                />
            ))}
        </>
    );
}