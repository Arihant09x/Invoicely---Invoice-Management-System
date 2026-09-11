import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { compactMoney } from "@/lib/format";
import type { DashboardOverview } from "@/types/api";

const BUCKET_LABELS: Record<string, string> = {
  "0-7": "0–7d",
  "8-15": "8–15d",
  "16-30": "16–30d",
  "31+": "31d+",
};

export function AgingBarChart({
  data,
}: {
  data: DashboardOverview["breakdowns"]["overdueAging"];
}) {
  const chartData = data.map((d) => ({
    bucket: BUCKET_LABELS[d.bucket] ?? d.bucket,
    amount: d.amount,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Overdue aging</CardTitle>
      </CardHeader>
      <CardContent className="h-[240px]">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No overdue invoices
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ left: 0, right: 8, top: 8 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                className="stroke-muted"
              />
              <XAxis
                dataKey="bucket"
                tickLine={false}
                axisLine={false}
                fontSize={12}
              />
              <YAxis
                tickFormatter={(v) => compactMoney(Number(v ?? 0))}
                tickLine={false}
                axisLine={false}
                fontSize={12}
              />
              <Tooltip
                formatter={(v) => compactMoney(Number(v ?? 0))}
                contentStyle={{ borderRadius: 12 }}
              />
              <Bar dataKey="amount" name="Outstanding" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}