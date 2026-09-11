import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS: Record<string, string> = {
  DRAFT: "#94a3b8",
  PENDING: "#f59e0b",
  PAID: "#10b981",
  OVERDUE: "#ef4444",
  CANCELLED: "#6b7280",
};

export function StatusDonut({ counts }: { counts: Record<string, number> }) {
  const data = Object.entries(counts).map(([name, value]) => ({ name, value }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Status distribution</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No invoices in range
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={3}
              >
                {data.map((d) => (
                  <Cell key={d.name} fill={COLORS[d.name] ?? "#64748b"} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12 }} />
              <Legend verticalAlign="bottom" iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
