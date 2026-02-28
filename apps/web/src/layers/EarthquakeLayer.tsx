import type {GeoProjection} from "d3";
import type {Earthquake} from "@worldmonitor/types";
import {depthColor, magRadius} from "../constants/layers";
import {useMapStore} from "../store/useMapStore";

interface Props {
    quakes: Earthquake[];
    projection: GeoProjection;
    svgRef: React.RefObject<SVGSVGElement>;
    scale: number;
}

export function EarthquakeLayer({quakes, projection, svgRef, scale}: Props) {
    const {selected, setSelected, setTooltip} = useMapStore();

    return (
        <>
            {quakes.map((q) => {
                const pt = projection([q.lon, q.lat]);
                if (!pt) return null;

                const color = depthColor(q.depth);
                const r = magRadius(q.mag) / scale;
                const isSelected = selected?.name === q.place;

                return (
                    <g
                        key={q.id}
                        style={{cursor: "pointer"}}
                        onMouseEnter={(e) => {
                            const rect = svgRef.current?.getBoundingClientRect();
                            if (!rect) return;
                            setTooltip({
                                x: e.clientX - rect.left,
                                y: e.clientY - rect.top,
                                content: `M${q.mag.toFixed(1)} — ${q.place}`,
                                sub: `Depth: ${q.depth.toFixed(0)} km · ${new Date(q.time).toLocaleDateString()}`,
                                type: "earthquake",
                                color,
                            });
                        }}
                        onMouseLeave={() => setTooltip(null)}
                        onClick={() =>
                            setSelected({
                                name: q.place,
                                magnitude: q.mag,
                                depth: `${q.depth.toFixed(1)} km`,
                                time: new Date(q.time).toUTCString(),
                                status: q.status,
                                tsunami: q.tsunami ? "⚠ TSUNAMI WARNING" : "None",
                                lat: q.lat,
                                lon: q.lon,
                            })
                        }
                    >
                        {/* Outer pulse ring for M5+ */}
                        {q.mag >= 5 && (
                            <circle
                                cx={pt[0]} cy={pt[1]}
                                r={r * 1.8}
                                fill="none"
                                stroke={color}
                                strokeWidth={0.4 / scale}
                                strokeOpacity={0.35}
                            />
                        )}
                        <circle
                            cx={pt[0]} cy={pt[1]}
                            r={r}
                            fill={color}
                            fillOpacity={isSelected ? 1 : 0.65}
                            stroke={isSelected ? "#fff" : color}
                            strokeWidth={isSelected ? 0.8 / scale : 0.2 / scale}
                            strokeOpacity={0.8}
                            clipPath="url(#mapClip)"
                        />
                    </g>
                );
            })}
        </>
    );
}