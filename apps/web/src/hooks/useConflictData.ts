import {useQuery} from "@tanstack/react-query";
import type {ConflictEvent, ConflictHotspot} from "@worldmonitor/types";

const fetchJson = (url: string) => fetch(url).then((r) => r.json());

export function useConflictHotspots() {
    return useQuery<ConflictHotspot[]>({
        queryKey: ["conflict_hotspots"],
        queryFn: () => fetchJson("/api/conflict/hotspots"),
        staleTime: 30 * 60_000,
        refetchInterval: 30 * 60_000,
    });
}

export function useConflictEvents() {
    return useQuery<ConflictEvent[]>({
        queryKey: ["conflict_events"],
        queryFn: () => fetchJson("/api/conflict/events"),
        staleTime: 30 * 60_000,
        refetchInterval: 30 * 60_000,
    });
}

export function useConflictMeta() {
    return useQuery<{ source: string; hasACLED: boolean; lastUpdated: string }>({
        queryKey: ["conflict_meta"],
        queryFn: () => fetchJson("/api/conflict/meta"),
        staleTime: Infinity,
    });
}