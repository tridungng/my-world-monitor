import type {GeoGeometryObjects} from "d3";
import {useMapStore} from "../store/useMapStore";

interface Props {
    data: GeoJSON.FeatureCollection;
    pathGen: (geo: GeoGeometryObjects | null | undefined) => string | null;
    svgRef: React.RefObject<SVGSVGElement>;
}

export function CountriesLayer({data, pathGen, svgRef}: Props) {
    const {selected, setSelected, setTooltip} = useMapStore();

    return (
        <>
            {data.features.map((f, i) => {
                const name = (f.properties as Record<string, string>)?.ADMIN;
                const isSelected = selected?.name === name;
                return (
                    <path
                        key={i}
                        className="country-path"
                        d={pathGen(f.geometry) ?? ""}
                        fill={isSelected ? "rgba(56,189,248,0.2)" : "rgba(10,30,50,0.7)"}
                        stroke={isSelected ? "#38bdf8" : "#1a3a5c"}
                        strokeWidth={isSelected ? 1.0 : 0.3}
                        clipPath="url(#mapClip)"
                        onMouseEnter={(e) => {
                            const rect = svgRef.current?.getBoundingClientRect();
                            if (!rect) return;
                            setTooltip({
                                x: e.clientX - rect.left,
                                y: e.clientY - rect.top,
                                content: name ?? "Unknown",
                                type: "country",
                            });
                        }}
                        onMouseLeave={() => setTooltip(null)}
                        onClick={() => {
                            const p = f.properties as Record<string, unknown>;
                            setSelected({
                                name: String(p?.ADMIN ?? ""),
                                continent: String(p?.CONTINENT ?? ""),
                                economy: String(p?.ECONOMY ?? ""),
                                population: String(p?.POP_EST ?? ""),
                                gdp: `${p?.GDP_MD_EST}M USD`,
                                iso: String(p?.ISO_A3 ?? ""),
                            });
                        }}
                    />
                );
            })}
        </>
    );
}