import { useCountries, useCables, useBases } from "./useMapData";
import { useEarthquakes, useEONET } from "./useDisasterData";

export function useMapDataQueries() {
  const { data: countries, status: cStatus } = useCountries();
  const { data: cables, status: caStatus } = useCables();
  const { data: basesData, status: bStatus } = useBases();
  const { data: quakes, status: qStatus } = useEarthquakes();
  const { data: eonetData, status: eStatus } = useEONET();

  return {
    countries,
    cables,
    basesData,
    quakes,
    eonetData,
    statuses: { cStatus, caStatus, bStatus, qStatus, eStatus },
  };
}

