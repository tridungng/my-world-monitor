import { useQuery } from "@tanstack/react-query";
import type { MilitaryBase } from "@worldmonitor/types";

const fetchJson = (url: string) => fetch(url).then((r) => r.json());

export function useCountries() {
    return useQuery<GeoJSON.FeatureCollection>({
        queryKey: ["countries"],
        queryFn: () => fetchJson("/api/layers/countries"),
        staleTime: 1000 * 60 * 60, // 1 hour — data won't change
    });
}

export function useCables() {
    return useQuery<GeoJSON.FeatureCollection>({
        queryKey: ["cables"],
        queryFn: () => fetchJson("/api/layers/cables"),
        staleTime: 1000 * 60 * 60,
    });
}

export function useBases() {
    return useQuery<{ features: MilitaryBase[] }>({
        queryKey: ["bases"],
        queryFn: () => fetchJson("/api/layers/bases"),
        staleTime: 1000 * 60 * 5, // 5 min — could be updated later
    });
}