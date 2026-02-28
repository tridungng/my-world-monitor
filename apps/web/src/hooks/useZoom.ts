import {useEffect, useRef, useCallback, useState} from "react";
import * as d3 from "d3";

export function useZoom(svgEl: SVGSVGElement | null) {
    const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
    const [transform, setTransform] = useState(d3.zoomIdentity);

    useEffect(() => {
        if (!svgEl) return;
        const zoom = d3
            .zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.5, 12])
            .on("zoom", (e) => setTransform(e.transform));
        d3.select(svgEl).call(zoom);
        zoomRef.current = zoom;
        return () => {
            d3.select(svgEl).on(".zoom", null);
        };
    }, [svgEl]);

    const zoomIn = useCallback(() => {
        if (!svgEl || !zoomRef.current) return;
        d3.select(svgEl).transition().duration(280).call(zoomRef.current.scaleBy, 1.5);
    }, [svgEl]);

    const zoomOut = useCallback(() => {
        if (!svgEl || !zoomRef.current) return;
        d3.select(svgEl).transition().duration(280).call(zoomRef.current.scaleBy, 0.67);
    }, [svgEl]);

    const zoomReset = useCallback(() => {
        if (!svgEl || !zoomRef.current) return;
        d3.select(svgEl).transition().duration(480).call(zoomRef.current.transform, d3.zoomIdentity);
    }, [svgEl]);

    return {transform, zoomIn, zoomOut, zoomReset};
}