import { useEffect, useRef, useState, useCallback } from "react";
import type { Aircraft, FlightSnapshot } from "@worldmonitor/types";
import { useMapStore } from "../store/useMapStore";

export function useFlightStream() {
    const [aircraft, setAircraft]  = useState<Aircraft[]>([]);
    const [lastUpdate, setLastUpdate] = useState<number | null>(null);
    const esRef = useRef<EventSource | null>(null);
    const { setFlightStreamStatus, setFlightCount } = useMapStore.getState();

    const connect = useCallback(() => {
        // Tear down previous connection
        esRef.current?.close();
        setFlightStreamStatus("connecting");

        const es = new EventSource("/api/flights/stream");
        esRef.current = es;

        es.addEventListener("snapshot", (e: MessageEvent) => {
            try {
                const snap: FlightSnapshot = JSON.parse(e.data);
                setAircraft(snap.aircraft);
                setLastUpdate(snap.time);
                setFlightCount(snap.count);
                setFlightStreamStatus("live");
            } catch { /* ignore parse errors */ }
        });

        es.addEventListener("error", () => {
            setFlightStreamStatus("error");
            // Auto-reconnect after 15s
            setTimeout(connect, 15_000);
        });

        es.onerror = () => {
            if (es.readyState === EventSource.CLOSED) {
                setFlightStreamStatus("error");
                setTimeout(connect, 15_000);
            }
        };
    }, [setFlightStreamStatus, setFlightCount]);

    useEffect(() => {
        connect();
        return () => {
            esRef.current?.close();
            setFlightStreamStatus("idle");
        };
    }, [connect, setFlightStreamStatus]);

    return { aircraft, lastUpdate };
}