interface Props {
    onZoomIn: () => void;
    onZoomOut: () => void;
    onReset: () => void;
}

export function ZoomControls({onZoomIn, onZoomOut, onReset}: Props) {
    const btnStyle = {
        width: 32, height: 32,
        background: "#050e1a",
        border: "1px solid #1a3a5c",
        color: "#38bdf8",
        fontSize: 14,
        borderRadius: 3,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
    } as const;

    return (
        <div style={{
            position: "absolute",
            right: 16,
            top: 16,
            display: "flex",
            flexDirection: "column",
            gap: 4,
            zIndex: 20
        }}>
            <button style={btnStyle} onClick={onZoomIn}>+</button>
            <button style={btnStyle} onClick={onReset}>⌂</button>
            <button style={btnStyle} onClick={onZoomOut}>−</button>
        </div>
    );
}