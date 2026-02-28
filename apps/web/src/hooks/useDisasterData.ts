import {useQuery} from "@tanstack/react-query";
import type {Earthquake, EONETEvent} from "@worldmonitor/types";

const fetchJson = (url: string) => fetch(url).then((r) => r.json());

export function useEarthquakes() {
    return useQuery<Earthquake[]>({
        queryKey: ["earthquakes"],
        queryFn: () => fetchJson("/api/disasters/earthquakes"),
        refetchInterval: 60_000,      // re-poll every 60s
        staleTime: 30_000,
    });
}

export function useEONET() {
    return useQuery<EONETEvent[]>({
        queryKey: ["eonet"],
        queryFn: () => fetchJson("/api/disasters/eonet"),
        refetchInterval: 5 * 60_000,  // re-poll every 5 min
        staleTime: 2 * 60_000,
    });
}