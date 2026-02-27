import { useMemo } from "react";
import type { MilitaryBase, Earthquake, EONETEvent } from "@worldmonitor/types";
import { useMapStore } from "../store/useMapStore";

export function useFilteredData(
  basesData: { features: MilitaryBase[] } | undefined,
  quakes: Earthquake[] | undefined,
  eonetData: EONETEvent[] | undefined
) {
  const { filterBranch, minMagnitude, eonetCategories } = useMapStore();
  const allBases = basesData?.features ?? [];

  const filteredBases = useMemo(
    () =>
      filterBranch === "ALL"
        ? allBases
        : allBases.filter((b) => b.branch === filterBranch),
    [allBases, filterBranch]
  );

  const filteredQuakes = useMemo(
    () => ((quakes as Earthquake[] | undefined) ?? []).filter((q) => q.mag >= minMagnitude),
    [quakes, minMagnitude]
  );

  const filteredEONET = useMemo(
    () => ((eonetData as EONETEvent[] | undefined) ?? []).filter((e) => eonetCategories.has(e.category)),
    [eonetData, eonetCategories]
  );

  const uniqueBranches = useMemo(
    () => ["ALL", ...new Set(allBases.map((b) => b.branch))],
    [allBases]
  );

  return { filteredBases, filteredQuakes, filteredEONET, uniqueBranches };
}

