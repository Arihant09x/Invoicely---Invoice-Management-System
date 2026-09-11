import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboard.api";
import { qk } from "@/lib/query-keys";

const RANGES = {
  "7d": { days: 7, groupBy: "day" },
  "30d": { days: 30, groupBy: "day" },
  "90d": { days: 90, groupBy: "week" },
} as const;

export type DashboardRange = keyof typeof RANGES;

/**
 * Single-shot dashboard query. The query KEY is literally the tab id
 * ("7d" | "30d" | "90d") — date math happens ONCE inside the queryFn and
 * never flows through React state/render — so no re-render, focus change,
 * or animation frame can ever mint a new key and refetch. Tab switches are
 * the only thing that can fire a new request.
 */
export function useDashboard(range: DashboardRange) {
  return useQuery({
    queryKey: qk.dashboard({ range }),
    queryFn: async () => {
      const { days, groupBy } = RANGES[range];
      const to = new Date();
      to.setHours(23, 59, 59, 0);
      const from = new Date(to);
      from.setDate(from.getDate() - days);
      from.setHours(0, 0, 0, 0);
      return dashboardApi.overview({
        dateFrom: from.toISOString(),
        dateTo: to.toISOString(),
        groupBy,
      });
    },
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchInterval: false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    placeholderData: (prev) => prev,
    retry: 1,
  });
}
