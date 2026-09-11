import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, CheckCircle2, FileText, Wallet } from "lucide-react";

import { useDashboard, type DashboardRange } from "../hooks/useDashboard";
import { AgingBarChart } from "../components/AgingBarChart";
import { KpiCard } from "../components/KpiCard";
import { RecentInvoicesTable } from "../components/RecentInvoicesTable";
import { RevenueAreaChart } from "../components/RevenueAreaChart";
import { StatusDonut } from "../components/StatusDonut";
import { TopClientsList } from "../components/TopClientsList";
import { money } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { DashboardOverview } from "@/types/api";

const TABS: DashboardRange[] = ["7d", "30d", "90d"];
const EMPTY_OVERVIEW: DashboardOverview = {
  range: { from: "", to: "", groupBy: "day" },
  kpis: {
    totalInvoices: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
    draftInvoices: 0,
    cancelledInvoices: 0,
    totalRevenue: 0,
    outstandingAmount: 0,
    overdueAmount: 0,
    avgInvoiceValue: 0,
  },
  breakdowns: { statusCounts: {}, statusAmounts: {}, overdueAging: [] },
  charts: { timeSeries: [] },
  tables: { recentInvoices: [], overdueInvoices: [], topClients: [] },
};

export default function DashboardPage() {
  // The query KEY is `<range tab> + <calendar day>` — recomputed only when
  // `range` changes — so re-renders (animations, focus, parent updates) can
  // never build a new key and trigger the fetch → re-render → fetch storm
  // (a GET /dashboard/overview every ~2s with the skeleton up forever).
  // Full ISO timestamps still go to the backend, but they live in a ref
  // that only changes when the tab changes, so the key stays put.
  const [range, setRange] = useState<DashboardRange>("30d");
  const navigate = useNavigate();

  const { user } = useAuth();

  const { data, isLoading, isFetching, isError, error, refetch } =
    useDashboard(range);

  if (isError) {
    return (
      <div className="flex  items-center justify-center">
        <Card className="w-fit p-8 text-center">
          <p className="font-medium">Couldn't load dashboard</p>
          <p className="text-sm text-muted-foreground">
            {(error as Error).message}
          </p>
          <Button className="w-full mt-4" onClick={() => refetch()}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  const d = data ?? EMPTY_OVERVIEW;
  // `isLoading` is only true on the very first fetch; `isFetching` covers
  // tab switches — keep old data on screen while refetching instead of
  // flashing skeletons.
  const showSkeleton = isLoading && !data;
  const refreshing = isFetching && !isLoading;

  const initials = (user?.name ?? user?.email ?? "U")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
            </h1>
            <p className="text-sm text-muted-foreground">
              Overview of your invoicing activity.
              {refreshing && " · updating…"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Tabs
            value={range}
            onValueChange={(v) => setRange(v as DashboardRange)}
          >
            <TabsList>
              {TABS.map((t) => (
                <TabsTrigger key={t} value={t}>
                  {t}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <Button onClick={() => navigate("/invoices/new")}>New invoice</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {showSkeleton ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[104px] rounded-xl" />
          ))
        ) : (
          <>
            <KpiCard
              index={0}
              label="Total invoices"
              value={d.kpis.totalInvoices}
              icon={FileText}
              accent="indigo"
            />
            <KpiCard
              index={1}
              label="Paid"
              value={d.kpis.totalRevenue}
              icon={CheckCircle2}
              accent="emerald"
              format={(n) => money(n)}
              hint={`${d.kpis.paidInvoices} invoices`}
            />
            <KpiCard
              index={2}
              label="Outstanding"
              value={d.kpis.outstandingAmount}
              icon={Wallet}
              accent="amber"
              format={(n) => money(n)}
              hint={`${d.kpis.pendingInvoices} pending`}
            />
            <KpiCard
              index={3}
              label="Overdue"
              value={d.kpis.overdueInvoices}
              icon={AlertTriangle}
              accent="rose"
              hint={money(d.kpis.overdueAmount)}
            />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <RevenueAreaChart data={d.charts.timeSeries} />
        <StatusDonut counts={d.breakdowns.statusCounts} />
      </div>

      {/* Aging + top clients */}
      <div className="grid gap-4 lg:grid-cols-3">
        <AgingBarChart data={d.breakdowns.overdueAging} />
        <TopClientsList
          clients={d.tables.topClients}
          isLoading={showSkeleton}
        />
      </div>

      {/* Recent invoices */}
      <RecentInvoicesTable
        invoices={d.tables.recentInvoices}
        isLoading={showSkeleton}
      />
    </div>
  );
}
