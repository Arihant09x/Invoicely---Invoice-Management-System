import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { formatISO } from "date-fns";
import { Download, Plus } from "lucide-react";

import { useInvoices } from "../hooks/useInvoices";
import { useBulkActions } from "../hooks/useBulkActions";
import { useDeleteInvoice } from "../hooks/useInvoiceMutations";
import { useExportCsv } from "../hooks/useExportCsv";
import {
  InvoiceFilters,
  type FiltersValue,
} from "../components/InvoiceFilters";
import {
  InvoiceTable,
  type InvoiceSortKey,
} from "../components/InvoiceTable";
import { BulkActionBar } from "../components/BulkActionBar";
import { DeleteInvoiceDialog } from "../components/DeleteInvoiceDialog";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type {
  Invoice,
  InvoiceQueryParams,
  InvoiceStatus,
} from "@/types/invoice";

export default function InvoiceListPage() {
  const { isAdmin, user } = useAuth();
  const [searchParams] = useSearchParams();

  const [filters, setFilters] = useState<FiltersValue>({
    q: "",
    status: (searchParams.get("status") as InvoiceStatus) ?? undefined,
  });
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [sortBy, setSortBy] = useState<InvoiceSortKey>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selected, setSelected] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Invoice | null>(null);

  const params: InvoiceQueryParams = useMemo(
    () => ({
      page,
      limit,
      sortBy,
      sortOrder,
      q: filters.q || undefined,
      status: filters.status,
      dateFrom: filters.range?.from ? formatISO(filters.range.from) : undefined,
      dateTo: filters.range?.to ? formatISO(filters.range.to) : undefined,
    }),
    [page, limit, sortBy, sortOrder, filters],
  );

  const { data, isLoading, isFetching } = useInvoices(params);
  const bulk = useBulkActions();
  const del = useDeleteInvoice();
  const exportCsv = useExportCsv();

  const rows = data?.data ?? [];
  const meta = data?.meta;

  const toggleSort = (key: InvoiceSortKey) => {
    if (sortBy === key) setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    else {
      setSortBy(key);
      setSortOrder("desc");
    }
    setPage(1);
  };

  const canEdit = (createdById: string) => isAdmin || createdById === user?.id;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
          <p className="text-sm text-muted-foreground">
            {meta ? `${meta.total} total` : "Loading..."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={exportCsv.isPending}
            onClick={() => exportCsv.mutate(params)}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button render={<Link to="/invoices/new" />}>
            <Plus className="mr-2 h-4 w-4" />
            New invoice
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="space-y-4 p-4">
          <InvoiceFilters
            value={filters}
            onChange={(v) => {
              setFilters(v);
              setPage(1);
              setSelected([]);
            }}
          />

          <InvoiceTable
            rows={rows}
            selected={selected}
            isLoading={isLoading}
            skeletonRows={limit}
            sortBy={sortBy}
            sortOrder={sortOrder}
            canEdit={canEdit}
            canDelete={isAdmin}
            onToggleSort={toggleSort}
            onToggleSelect={(id, checked) =>
              setSelected((prev) =>
                checked ? [...prev, id] : prev.filter((p) => p !== id),
              )
            }
            onToggleSelectAll={(checked) =>
              setSelected(checked ? rows.map((r) => r.id) : [])
            }
            onRequestDelete={(inv) => setDeleteTarget(inv)}
          />
{meta && meta.totalPages > 0 && (
            <div className="flex items-center justify-between text-sm">
              <p className="text-muted-foreground">
                Page {meta.page} of {meta.totalPages}{" "}
                {isFetching && "· updating..."}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <BulkActionBar
        count={selected.length}
        pending={bulk.isPending}
        onClear={() => setSelected([])}
        onStatusChange={(status) =>
          bulk.mutate(
            { ids: selected, action: "UPDATE_STATUS", status },
            { onSuccess: () => setSelected([]) },
          )
        }
        onDelete={(hard) =>
          bulk.mutate(
            { ids: selected, action: hard ? "DELETE_HARD" : "DELETE_SOFT" },
            { onSuccess: () => setSelected([]) },
          )
        }
      />

      <DeleteInvoiceDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        invoiceNumber={deleteTarget?.invoiceNumber ?? ""}
        pending={del.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          del.mutate(
            { id: deleteTarget.id },
            { onSuccess: () => setDeleteTarget(null) },
          );
        }}
      />
    </div>
  );
}