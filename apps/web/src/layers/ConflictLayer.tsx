import type {GeoProjection} from "d3";
import type {ConflictHotspot, ConflictEvent} from "@worldmonitor/types";
import {SEVERITY_COLORS, TREND_ICONS, TREND_COLORS, conflictColor} from "../constants/layers";
import {useMapStore} from "../store/useMapStore";
import {RefObject, MouseEvent} from "react";

interface Props {
    hotspots: ConflictHotspot[];
    events: ConflictEvent[];
    projection: GeoProjection;
    svgRef: RefObject<SVGSVGElement>;
    scale: number;
    tick: number;
}

const SEVERITY_RANK = {critical: 4, high: 3, medium: 2, low: 1};
const MIN_SEVERITY_RANK: Record<string, number> = {low: 1, medium: 2, high: 3, critical: 4};

interface EventDotProps {
    event: ConflictEvent;
    projection: GeoProjection;
    scale: number;
    svgRef: RefObject<SVGSVGElement>;
}

interface HotspotMarkerProps {
    hotspot: ConflictHotspot;
    projection: GeoProjection;
    scale: number;
    tick: number;
    isSelected: boolean;
    svgRef: RefObject<SVGSVGElement>;
}

function EventDot({event, projection, scale, svgRef}: EventDotProps) {
    const {setSelected, setTooltip} = useMapStore();
    const pt = projection([event.lon, event.lat]);
    if (!pt) return null;

    const color = conflictColor(event.type);
    const radius = event.fatalities > 20 ? 3 / scale : event.fatalities > 5 ? 2 / scale : 1.2 / scale;

    const handleMouseEnter = (e: MouseEvent<SVGCircleElement>) => {
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return;
        setTooltip({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            content: event.location || event.country,
            sub: `${event.type} · ${event.fatalities} fatalities · ${event.actor1}`,
            type: "conflict",
            color,
        });
    };

    const handleClick = () => {
        setSelected({
            name: event.location || event.country,
            type: event.type,
            actor1: event.actor1,
            actor2: event.actor2 || "—",
            country: event.country,
            fatalities: event.fatalities,
            date: new Date(event.date).toLocaleDateString(),
            source: event.source,
            lat: event.lat,
            lon: event.lon,
        });
    };

    return (
        <circle
            key={event.id}
            cx={pt[0]}
            cy={pt[1]}
            r={radius}
            fill={color}
            fillOpacity={0.45}
            stroke="none"
            clipPath="url(#mapClip)"
            style={{cursor: "pointer"}}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={() => setTooltip(null)}
            onClick={handleClick}
        />
    );
}

function HotspotMarker({hotspot, projection, scale, tick, isSelected, svgRef}: HotspotMarkerProps) {
    const {setSelected, setTooltip} = useMapStore();
    const pt = projection([hotspot.lon, hotspot.lat]);
    if (!pt) return null;

    const color = SEVERITY_COLORS[hotspot.severity];
    const isCritical = hotspot.severity === "critical";
    const baseRadius = Math.log(hotspot.activeConflicts + 1) * 6;
    const pulseRadius = baseRadius * (1 + (tick % 2) * (isCritical ? 0.35 : 0.15));
    const trendIcon = TREND_ICONS[hotspot.trend] ?? "→";
    const trendColor = TREND_COLORS[hotspot.trend] ?? "#94a3b8";

    const handleMouseEnter = (e: MouseEvent<SVGGElement>) => {
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return;
        setTooltip({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            content: hotspot.name,
            sub: `${hotspot.severity.toUpperCase()} · ${hotspot.fatalities30d.toLocaleString()} fatalities · ${trendIcon} ${hotspot.trend}`,
            type: "hotspot",
            color,
        });
    };

    const handleClick = () => {
        setSelected({
            name: hotspot.name,
            country: hotspot.country,
            severity: hotspot.severity,
            trend: `${trendIcon} ${hotspot.trend}`,
            conflicts: hotspot.activeConflicts,
            fatalities: hotspot.fatalities30d,
            actors: hotspot.actors.join(", "),
            source: hotspot.isDemo ? "demo data" : "acled",
            lat: hotspot.lat,
            lon: hotspot.lon,
        });
    };

    return (
        <g
            key={hotspot.id}
            style={{cursor: "pointer"}}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={() => setTooltip(null)}
            onClick={handleClick}
        >
            <circle
                cx={pt[0]}
                cy={pt[1]}
                r={pulseRadius / scale}
                fill={color}
                fillOpacity={isCritical ? 0.06 : 0.04}
                stroke={color}
                strokeWidth={(isSelected ? 1.2 : 0.6) / scale}
                strokeOpacity={isCritical ? 0.7 : 0.45}
                clipPath="url(#mapClip)"
            />
            <circle
                cx={pt[0]}
                cy={pt[1]}
                r={4 / scale}
                fill={color}
                fillOpacity={isSelected ? 1 : 0.85}
                stroke={isSelected ? "#fff" : color}
                strokeWidth={0.5 / scale}
                clipPath="url(#mapClip)"
            />
            <text
                x={pt[0] + 5 / scale}
                y={pt[1] - 5 / scale}
                fontSize={8 / scale}
                fill={trendColor}
                fontFamily="monospace"
                style={{userSelect: "none", pointerEvents: "none"}}
            >
                {trendIcon}
            </text>
            {isCritical && (
                <text
                    x={pt[0]}
                    y={pt[1] - baseRadius / scale - 4 / scale}
                    textAnchor="middle"
                    fontSize={7 / scale}
                    fill={color}
                    fontFamily="'JetBrains Mono', monospace"
                    fontWeight="700"
                    style={{userSelect: "none", pointerEvents: "none"}}
                >
                    ⚠ CRITICAL
                </text>
            )}
        </g>
    );
}

export function ConflictLayer({hotspots, events, projection, svgRef, scale, tick}: Props) {
    const {selected, minConflictSeverity} = useMapStore();
    const minRank = MIN_SEVERITY_RANK[minConflictSeverity] ?? 1;

    const filteredHotspots = hotspots.filter((h) => SEVERITY_RANK[h.severity] >= minRank);

    return (
        <>
            {events.slice(0, 400).map((event) => (
                <EventDot key={event.id} event={event} projection={projection} scale={scale} svgRef={svgRef}/>
            ))}
            {filteredHotspots.map((hotspot) => (
                <HotspotMarker
                    key={hotspot.id}
                    hotspot={hotspot}
                    projection={projection}
                    scale={scale}
                    tick={tick}
                    isSelected={selected?.name === hotspot.name}
                    svgRef={svgRef}
                />
            ))}
        </>
    );
}