import { useMemo } from "react";
import * as d3 from "d3";

export function useProjection(width: number, height: number) {
    const projection = useMemo(
        () =>
            d3
                .geoNaturalEarth1()
                .scale(width / 6.3)
                .translate([width / 2, height / 2]),
        [width, height]
    );

    const pathGen = useMemo(
        () => d3.geoPath().projection(projection),
        [projection]
    );

    const graticule = useMemo(() => d3.geoGraticule()(), []);
    const sphere = useMemo((): unknown => ({ type: "Sphere" as const }), []);

    return { projection, pathGen, graticule, sphere };
}