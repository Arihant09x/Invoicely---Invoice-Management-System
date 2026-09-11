import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { compactMoney, money } from "@/lib/format";
import type { DashboardOverview } from "@/types/api";

export function RevenueAreaChart({
  data,
}: {
  data: DashboardOverview["charts"]["timeSeries"];
}) {
  const chartData = data.map((d) => ({
    ...d,
    label: format(parseISO(d.bucket), "dd MMM"),
  }));

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Revenue vs Outstanding</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ left: -12, right: 8, top: 8 }}>
            <defs>
              <linearGradient id="paid" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="out" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              className="stroke-muted"
            />
            <XAxis
              dataKey="label"
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
              formatter={(v, n) => [
                money(Number(v ?? 0)),
                n === "revenuePaid" ? "Paid" : "Outstanding",
              ]}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid hsl(var(--border))",
              }}
            />
            <Area
              type="monotone"
              dataKey="revenuePaid"
              stroke="#10b981"
              fill="url(#paid)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="outstanding"
              stroke="#f59e0b"
              fill="url(#out)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
