import { useMemo } from "react";

interface Statuses {
  cStatus: string;
  caStatus: string;
  bStatus: string;
  qStatus: string;
  eStatus: string;
}

export function useDataStatusMapping(statuses: Statuses) {
  const toStatus = (s: string) =>
    s === "success" ? "ok" : s === "error" ? "error" : "loading";

  return useMemo(
    () => ({
      countries: toStatus(statuses.cStatus),
      cables: toStatus(statuses.caStatus),
      bases: toStatus(statuses.bStatus),
      earthquakes: toStatus(statuses.qStatus),
      eonet: toStatus(statuses.eStatus),
    }),
    [statuses.cStatus, statuses.caStatus, statuses.bStatus, statuses.qStatus, statuses.eStatus]
  );
}

