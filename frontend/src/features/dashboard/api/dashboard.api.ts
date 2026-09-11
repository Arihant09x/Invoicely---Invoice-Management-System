import { api } from "@/lib/api-client";
import type { DashboardOverview } from "@/types/api";

function startOfDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

export const dashboardApi = {
  overview: async (params: {
    dateFrom?: string;
    dateTo?: string;
    groupBy?: string;
  }) => {
    // Default to whole calendar days so every identical tab selection
    // produces an identical cache key (no per-second refetch loop).
    const to = params.dateTo ?? startOfDay(new Date()).toISOString();
    const from = params.dateFrom ?? to;
    return (
      await api.get<DashboardOverview>("/dashboard/overview", {
        params: { ...params, dateFrom: from, dateTo: to },
      })
    ).data;
  },
};
