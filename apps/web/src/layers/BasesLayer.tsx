import type {GeoProjection} from "d3";
import type {MilitaryBase} from "@worldmonitor/types";
import {BRANCH_COLORS} from "../constants/layers";
import {useMapStore} from "../store/useMapStore";

interface Props {
    bases: MilitaryBase[];
    projection: GeoProjection;
    svgRef: React.RefObject<SVGSVGElement>;
    scale: number;
    tick: number;
}

function fmt(n: number) {
    if (!n) return "—";
    return n >= 1000 ? `${(n / 1000).toFixed(0)}k` : String(n);
}

export function BasesLayer({bases, projection, svgRef, scale, tick}: Props) {
    const {selected, setSelected, setTooltip} = useMapStore();

    return (
        <>
            {bases.map((base) => {
                const pt = projection([base.lon, base.lat]);
                if (!pt) return null;

                const color = BRANCH_COLORS[base.branch] ?? "#94b8d4";
                const isSelected = selected?.name === base.name;
                const r = (isSelected || base.type === "Nuclear") ? 5 : 3.5;
                const isPulsing = base.type === "Nuclear" || base.type === "Naval" || isSelected;
                const pulse = tick % 2 === 0 ? 0.9 : 0.3;

                return (
                    <g
                        key={base.id}
                        style={{cursor: "pointer"}}
                        onMouseEnter={(e) => {
                            const rect = svgRef.current?.getBoundingClientRect();
                            if (!rect) return;
                            setTooltip({
                                x: e.clientX - rect.left,
                                y: e.clientY - rect.top,
                                content: base.name,
                                sub: `${base.branch} · ${base.type} · ${fmt(base.personnel)} pers.`,
                                type: "base",
                                color,
                            });
                        }}
                        onMouseLeave={() => setTooltip(null)}
                        onClick={() =>
                            setSelected({
                                name: base.name,
                                country: base.country,
                                branch: base.branch,
                                type: base.type,
                                personnel: base.personnel?.toLocaleString() ?? "—",
                                lat: base.lat,
                                lon: base.lon,
                            })
                        }
                    >
                        {isPulsing && (
                            <circle
                                cx={pt[0]} cy={pt[1]}
                                r={r + 4}
                                fill="none"
                                stroke={color}
                                strokeWidth={0.5}
                                strokeOpacity={pulse}
                            />
                        )}
                        <circle
                            cx={pt[0]} cy={pt[1]}
                            r={r / scale + 0.5}
                            fill={color}
                            fillOpacity={0.9}
                            stroke="#03080f"
                            strokeWidth={0.8 / scale}
                            filter="url(#glow)"
                        />
                        {base.type === "Nuclear" && (
                            <text
                                x={pt[0]} y={pt[1] - r - 2}
                                textAnchor="middle"
                                fontSize={7 / scale}
                                fill="#f87171"
                                fontFamily="monospace"
                            >
                                ☢
                            </text>
                        )}
                    </g>
                );
            })}
        </>
    );
}