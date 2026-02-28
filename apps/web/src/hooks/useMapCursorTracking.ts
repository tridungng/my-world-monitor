import {useCallback} from "react";
import {useMapStore} from "../store/useMapStore";

export function useMapCursorTracking(
    svgRef: React.RefObject<SVGSVGElement>,
    projection: any,
    transform: any
) {
    const {setCursorPos} = useMapStore();

    const handleMouseMove = useCallback(
        (e: React.MouseEvent<SVGSVGElement>) => {
            const rect = svgRef.current?.getBoundingClientRect();
            if (!rect) return;
            const ix = transform.invertX(e.clientX - rect.left);
            const iy = transform.invertY(e.clientY - rect.top);
            const coords = projection.invert?.([ix, iy]);
            if (coords)
                setCursorPos({
                    lon: parseFloat(coords[0].toFixed(2)),
                    lat: parseFloat(coords[1].toFixed(2)),
                });
        },
        [projection, transform, setCursorPos]
    );

    return {handleMouseMove};
}

