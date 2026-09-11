import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/features/invoices/components/StatusBadge";
import { money, shortDate } from "@/lib/format";
import type { DashboardOverview } from "@/types/api";
import type { InvoiceStatus } from "@/types/invoice";

type RecentInvoice = DashboardOverview["tables"]["recentInvoices"][number];

export function RecentInvoicesTable({
  invoices,
  isLoading,
}: {
  invoices: RecentInvoice[];
  isLoading?: boolean;
}) {
  return (
    <Card className="lg:col-span-3">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base">Recent invoices</CardTitle>
        <Button variant="ghost" size="sm" render={<Link to="/invoices" />}>
          View all <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-11" />
            ))}
          </div>
        ) : invoices.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No invoices in range
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Client</TableHead>
                <TableHead className="hidden sm:table-cell">Due</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.slice(0, 5).map((inv) => (
                <TableRow key={inv.id} className="cursor-pointer">
                  <TableCell className="font-medium">
                    <Link
                      to={`/invoices/${inv.id}`}
                      className="hover:underline"
                    >
                      {inv.invoiceNumber}
                    </Link>
                  </TableCell>
                  <TableCell>{inv.clientName}</TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {shortDate(inv.dueDate)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={inv.status as InvoiceStatus} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {money(inv.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}