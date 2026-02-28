import type {GeoGeometryObjects} from "d3";
import {CABLE_COLORS} from "../constants/layers";
import {useMapStore} from "../store/useMapStore";

interface Props {
    data: GeoJSON.FeatureCollection;
    pathGen: (geo: GeoGeometryObjects | null | undefined) => string | null;
    svgRef: React.RefObject<SVGSVGElement>;
    scale: number;
}

export function CablesLayer({data, pathGen, svgRef, scale}: Props) {
    const {setSelected, setTooltip} = useMapStore();

    return (
        <>
            {data.features?.map((f, i) => {
                if (!f.geometry || f.geometry.type === "Point") return null;
                const color = CABLE_COLORS[i % CABLE_COLORS.length];
                const p = f.properties as Record<string, unknown>;
                return (
                    <path
                        key={i}
                        d={pathGen(f.geometry) ?? ""}
                        fill="none"
                        stroke={color}
                        strokeWidth={0.8 / scale}
                        strokeOpacity={0.55}
                        filter="url(#cableglow)"
                        clipPath="url(#mapClip)"
                        style={{cursor: "pointer"}}
                        onMouseEnter={(e) => {
                            const rect = svgRef.current?.getBoundingClientRect();
                            if (!rect) return;
                            setTooltip({
                                x: e.clientX - rect.left,
                                y: e.clientY - rect.top,
                                content: String(p?.name ?? "Submarine Cable"),
                                type: "cable",
                            });
                        }}
                        onMouseLeave={() => setTooltip(null)}
                        onClick={() =>
                            setSelected({
                                name: String(p?.name ?? "Submarine Cable"),
                                type: "Submarine Cable",
                                rfs: String(p?.rfs ?? "—"),
                                owners: (p?.owners as string[] | undefined)?.join(", ") ?? "—",
                                landing_points: String((p?.landing_points as unknown[])?.length ?? "—"),
                            })
                        }
                    />
                );
            })}
        </>
    );
}