interface Props {
    pathGen: (geo: unknown) => string | null;
    graticule: GeoJSON.Geometry;
    sphere: GeoJSON.Geometry;
}

export function GraticuleLayer({ pathGen, graticule, sphere }: Props) {
    return (
        <>
            <defs>
                <radialGradient id="sphereGrad" cx="40%" cy="40%">
                    <stop offset="0%"   stopColor="#061525" />
                    <stop offset="100%" stopColor="#020810" />
                </radialGradient>
                <clipPath id="mapClip">
                    <path d={pathGen(sphere) ?? ""} />
                </clipPath>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                <filter id="cableglow">
                    <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Ocean */}
            <path
                d={pathGen(sphere) ?? ""}
                fill="url(#sphereGrad)"
                stroke="#0f2a44"
                strokeWidth={0.5}
            />
            {/* Grid */}
            <path
                d={pathGen(graticule) ?? ""}
                fill="none"
                stroke="#0a1e33"
                strokeWidth={0.3}
                clipPath="url(#mapClip)"
            />
        </>
    );
}