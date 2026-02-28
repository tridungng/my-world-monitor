import {useQuery} from "@tanstack/react-query";
import type {FREDSeries} from "@worldmonitor/types";

export function useEconomicIndicators() {
    return useQuery<FREDSeries[]>({
        queryKey: ["economic_indicators"],
        queryFn: () => fetch("/api/economic/indicators").then((r) => r.json()),
        staleTime: 60 * 60_000, // 1 hour
        refetchInterval: 60 * 60_000,
    });
}