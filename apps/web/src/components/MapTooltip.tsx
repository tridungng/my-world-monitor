import type {TooltipState} from "../store/useMapStore";

interface Props {
    tooltip: TooltipState;
    transform: { x: number; y: number; k: number };
}

export function MapTooltip({tooltip, transform}: Props) {
    // Convert screen coords back to SVG space (before transform)
    const x = (tooltip.x - transform.x) / transform.k + 12;
    const y = (tooltip.y - transform.y) / transform.k - 10;
    const borderColor =
        tooltip.type === "base" ? (tooltip.color ?? "#38bdf8") :
            tooltip.type === "cable" ? "#f59e0b" :
                "#1a3a5c";

    return (
        <g pointerEvents="none">
            <rect
                x={x - 6} y={y - 14}
                width={190}
                height={tooltip.sub ? 38 : 24}
                rx={3}
                fill="#050e1a"
                stroke={borderColor}
                strokeWidth={0.5}
                fillOpacity={0.96}
            />
            <text x={x} y={y + 1} fontSize={9} fill="#e2f0ff" fontFamily="'JetBrains Mono', monospace" fontWeight="600">
                {tooltip.content.slice(0, 28)}
            </text>
            {tooltip.sub && (
                <text x={x} y={y + 16} fontSize={8} fill="#4a8aaa" fontFamily="'JetBrains Mono', monospace">
                    {tooltip.sub.slice(0, 32)}
                </text>
            )}
        </g>
    );
}