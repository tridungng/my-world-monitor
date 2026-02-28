import type {GeoProjection} from "d3";
import type {EONETEvent} from "@worldmonitor/types";
import {eonetStyle} from "../constants/layers";
import {useMapStore} from "../store/useMapStore";

interface Props {
    events: EONETEvent[];
    projection: GeoProjection;
    svgRef: React.RefObject<SVGSVGElement>;
    scale: number;
}

const BASE_FONT = 12;
const BASE_R = 7;

export function ENONETLayer({events, projection, svgRef, scale}: Props) {
    const {selected, setSelected, setTooltip} = useMapStore();

    return (
        <>
            {events.map((ev) => {
                const pt = projection([ev.lon, ev.lat]);
                if (!pt) return null;

                const style = eonetStyle(ev.category);
                const r = BASE_R / scale;
                const fontSize = BASE_FONT / scale;
                const isSelected = selected?.name === ev.title;

                return (
                    <g
                        key={ev.id}
                        style={{cursor: "pointer"}}
                        onMouseEnter={(e) => {
                            const rect = svgRef.current?.getBoundingClientRect();
                            if (!rect) return;
                            setTooltip({
                                x: e.clientX - rect.left,
                                y: e.clientY - rect.top,
                                content: ev.title,
                                sub: `${style.label} · ${new Date(ev.date).toLocaleDateString()}`,
                                type: "eonet",
                                color: style.color,
                            });
                        }}
                        onMouseLeave={() => setTooltip(null)}
                        onClick={() =>
                            setSelected({
                                name: ev.title,
                                category: ev.category,
                                date: new Date(ev.date).toUTCString(),
                                status: ev.closed ? "Closed" : "ACTIVE",
                                lat: ev.lat,
                                lon: ev.lon,
                            })
                        }
                    >
                        {/* Background circle */}
                        <circle
                            cx={pt[0]} cy={pt[1]}
                            r={r}
                            fill={style.color}
                            fillOpacity={isSelected ? 0.9 : 0.25}
                            stroke={style.color}
                            strokeWidth={isSelected ? 1 / scale : 0.5 / scale}
                            clipPath="url(#mapClip)"
                        />
                        {/* Icon */}
                        <text
                            x={pt[0]} y={pt[1]}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontSize={fontSize}
                            style={{userSelect: "none", pointerEvents: "none"}}
                            clipPath="url(#mapClip)"
                        >
                            {style.icon}
                        </text>
                    </g>
                );
            })}
        </>
    );
}