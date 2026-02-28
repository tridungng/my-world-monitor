import {useMapStore} from "../store/useMapStore";

interface DataStatus {
    countries: string;
    cables: string;
    bases: string;
    earthquakes?: string;
    eonet?: string;
    flights?: string
}

interface Props {
    status: DataStatus;
    baseCount: number;
    cableCount: number | string;
    nationCount: number | string;
    quakeCount: number | string;
}

const SSE_DOT: Record<string, { color: string; label: string }> = {
    live: {color: "#00ff88", label: "LIVE"},
    connecting: {color: "#f59e0b", label: "CONN…"},
    error: {color: "#ff4444", label: "ERR"},
    idle: {color: "#3a6a8a", label: "IDLE"},
};

interface CounterBoxProps {
    label: string;
    value: number | string;
    color: string;
}

interface DataHealthProps {
    status: DataStatus;
}

interface FlightStatusProps {
    flightStreamStatus: string;
    flightCount: number;
}

interface PanelToggleButtonProps {
    label: string;
    isOpen: boolean;
    onToggle: () => void;
    accentColor: string;
}

interface SidebarToggleProps {
    isOpen: boolean;
    onToggle: () => void;
}

function SidebarToggle({isOpen, onToggle}: SidebarToggleProps) {
    return (
        <button
            onClick={onToggle}
            style={{
                color: "#38bdf8",
                padding: "4px 8px",
                border: "1px solid #1a3a5c",
                borderRadius: 3,
                fontSize: 14,
                background: "transparent",
                cursor: "pointer"
            }}
        >
            {isOpen ? "◀" : "▶"}
        </button>
    );
}

function CounterBox({label, value, color}: CounterBoxProps) {
    return (
        <div style={{
            display: "flex",
            gap: 5,
            alignItems: "center",
            background: "#071523",
            border: "1px solid #0f2a44",
            padding: "4px 8px",
            borderRadius: 3
        }}>
            <span style={{fontSize: 9, color: "#3a6a8a", letterSpacing: "0.1em"}}>{label}</span>
            <span style={{fontSize: 13, fontWeight: 700, color}}>{value}</span>
        </div>
    );
}

function FlightStatus({flightStreamStatus, flightCount}: FlightStatusProps) {
    const sseDot = SSE_DOT[flightStreamStatus];
    return (
        <div style={{
            display: "flex",
            gap: 5,
            alignItems: "center",
            background: "#071523",
            border: `1px solid ${sseDot.color}33`,
            padding: "4px 8px",
            borderRadius: 3
        }}>
            <div style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: sseDot.color,
                boxShadow: `0 0 4px ${sseDot.color}`
            }}/>
            <span style={{fontSize: 9, color: "#3a6a8a"}}>FLIGHTS</span>
            <span style={{fontSize: 13, fontWeight: 700, color: "#34d399"}}>{flightCount.toLocaleString()}</span>
        </div>
    );
}

function DataHealth({status}: DataHealthProps) {
    return (
        <div style={{display: "flex", gap: 5, alignItems: "center"}}>
            {Object.entries(status).map(([k, v]) => (
                <div key={k} style={{display: "flex", gap: 3, alignItems: "center"}}>
                    <div style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: v === "ok" ? "#00ff88" : v === "error" ? "#ff4444" : "#f59e0b"
                    }}/>
                    <span style={{fontSize: 8, color: "#3a6a8a"}}>{k.slice(0, 3).toUpperCase()}</span>
                </div>
            ))}
        </div>
    );
}

function PanelToggleButton({label, isOpen, onToggle, accentColor}: PanelToggleButtonProps) {
    return (
        <button
            onClick={onToggle}
            style={{
                padding: "4px 9px", fontSize: 9, letterSpacing: "0.06em",
                background: isOpen ? `${accentColor}1a` : "transparent",
                border: `1px solid ${isOpen ? accentColor : "#1a3a5c"}`,
                color: isOpen ? accentColor : "#4a7a8a",
                borderRadius: 3, cursor: "pointer",
            }}
        >
            {label}
        </button>
    );
}

export function TopBar({status, baseCount, cableCount, nationCount, quakeCount}: Props) {
    const {
        sidebarOpen, setSidebarOpen,
        economicPanelOpen, setEconomicPanelOpen,
        conflictPanelOpen, setConflictPanelOpen,
        flightStreamStatus, flightCount,
    } = useMapStore();

    const handleConflictToggle = () => {
        setConflictPanelOpen(!conflictPanelOpen);
        if (economicPanelOpen) setEconomicPanelOpen(false);
    };

    const handleEconomicToggle = () => {
        setEconomicPanelOpen(!economicPanelOpen);
        if (conflictPanelOpen) setConflictPanelOpen(false);
    };

    return (
        <div style={{
            height: 48,
            background: "#050e1a",
            borderBottom: "1px solid #0f2a44",
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            gap: 10,
            flexShrink: 0,
            zIndex: 100
        }}>
            <SidebarToggle isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)}/>

            <div style={{display: "flex", alignItems: "center", gap: 8}}>
                <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#00ff88",
                    boxShadow: "0 0 6px #00ff88"
                }}/>
                <span style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#e2f0ff",
                    letterSpacing: "0.12em"
                }}>WORLD MONITOR</span>
                <span style={{fontSize: 10, color: "#3a6a8a", letterSpacing: "0.08em"}}>v3.0</span>
            </div>

            <div style={{flex: 1}}/>

            <CounterBox label="BASES" value={baseCount} color="#38bdf8"/>
            <CounterBox label="CABLES" value={cableCount} color="#f59e0b"/>
            <CounterBox label="NATIONS" value={nationCount} color="#34d399"/>
            <CounterBox label="EQ" value={quakeCount} color="#ff6b35"/>

            <FlightStatus flightStreamStatus={flightStreamStatus} flightCount={flightCount}/>

            <DataHealth status={status}/>

            <PanelToggleButton label="⚔ CONFLICT" isOpen={conflictPanelOpen} onToggle={handleConflictToggle}
                               accentColor="#f87171"/>
            <PanelToggleButton label="📈 ECONOMIC" isOpen={economicPanelOpen} onToggle={handleEconomicToggle}
                               accentColor="#38bdf8"/>

            <div style={{fontSize: 10, color: "#3a6a8a", minWidth: 130, textAlign: "right"}}>
                {new Date().toUTCString().slice(0, 25)} UTC
            </div>
        </div>
    );
}