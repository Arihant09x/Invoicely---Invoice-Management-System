import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { money } from "@/lib/format";
import type { DashboardOverview } from "@/types/api";

type TopClient = DashboardOverview["tables"]["topClients"][number];

export function TopClientsList({
  clients,
  isLoading,
}: {
  clients: TopClient[];
  isLoading?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Top clients by outstanding</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10" />
          ))
        ) : clients.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing outstanding 🎉</p>
        ) : (
          clients.map((c) => (
            <div
              key={c.clientName}
              className="flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{c.clientName}</p>
                <p className="text-xs text-muted-foreground">
                  {c.invoices} invoice(s)
                </p>
              </div>
              <span className="shrink-0 text-sm font-semibold tabular-nums">
                {money(c.outstanding)}
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}