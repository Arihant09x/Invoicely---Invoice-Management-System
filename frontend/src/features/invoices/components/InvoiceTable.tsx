import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Eye,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "./StatusBadge";
import { money, shortDate } from "@/lib/format";
import type { Invoice, InvoiceQueryParams } from "@/types/invoice";

export type InvoiceSortKey = NonNullable<InvoiceQueryParams["sortBy"]>;

export interface InvoiceTableProps {
  rows: Invoice[];
  selected: string[];
  isLoading: boolean;
  skeletonRows: number;
  sortBy: InvoiceSortKey;
  sortOrder: "asc" | "desc";
  canEdit: (createdById: string) => boolean;
  canDelete: boolean;
  onToggleSort: (key: InvoiceSortKey) => void;
  onToggleSelect: (id: string, checked: boolean) => void;
  onToggleSelectAll: (checked: boolean) => void;
  onRequestDelete: (invoice: Invoice) => void;
}

function SortIcon({
  col,
  sortBy,
  sortOrder,
}: {
  col: InvoiceSortKey;
  sortBy: InvoiceSortKey;
  sortOrder: "asc" | "desc";
}) {
  if (sortBy !== col) {
    return <ArrowUpDown className="ml-1 h-3.5 w-3.5 opacity-40" />;
  }
  return sortOrder === "asc" ? (
    <ArrowUp className="ml-1 h-3.5 w-3.5" />
  ) : (
    <ArrowDown className="ml-1 h-3.5 w-3.5" />
  );
}

export function InvoiceTable({
  rows,
  selected,
  isLoading,
  skeletonRows,
  sortBy,
  sortOrder,
  canEdit,
  canDelete,
  onToggleSort,
  onToggleSelect,
  onToggleSelectAll,
  onRequestDelete,
}: InvoiceTableProps) {
  const allSelected = rows.length > 0 && selected.length === rows.length;

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead className="w-10">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(c) => onToggleSelectAll(c)}
              />
            </TableHead>
            <TableHead
              className="cursor-pointer select-none"
              onClick={() => onToggleSort("invoiceNumber")}
            >
              <span className="inline-flex items-center">
                Invoice{" "}
                <SortIcon
                  col="invoiceNumber"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                />
              </span>
            </TableHead>
            <TableHead>Client</TableHead>
            <TableHead
              className="hidden md:table-cell cursor-pointer select-none"
              onClick={() => onToggleSort("issueDate")}
            >
              <span className="inline-flex items-center">
                Issued{" "}
                <SortIcon
                  col="issueDate"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                />
              </span>
            </TableHead>
            <TableHead
              className="cursor-pointer select-none"
              onClick={() => onToggleSort("dueDate")}
            >
              <span className="inline-flex items-center">
                Due{" "}
                <SortIcon col="dueDate" sortBy={sortBy} sortOrder={sortOrder} />
              </span>
            </TableHead>
            <TableHead
              className="cursor-pointer select-none"
              onClick={() => onToggleSort("status")}
            >
              <span className="inline-flex items-center">
                Status{" "}
                <SortIcon col="status" sortBy={sortBy} sortOrder={sortOrder} />
              </span>
            </TableHead>
            <TableHead
              className="cursor-pointer select-none text-right"
              onClick={() => onToggleSort("amount")}
            >
              <span className="inline-flex items-center">
                Amount{" "}
                <SortIcon col="amount" sortBy={sortBy} sortOrder={sortOrder} />
              </span>
            </TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            Array.from({ length: skeletonRows }).map((_, i) => (
              <TableRow key={i}>
                <TableCell colSpan={8}>
                  <Skeleton className="h-8 w-full" />
                </TableCell>
              </TableRow>
            ))
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="py-16 text-center">
                <p className="font-medium">No invoices found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try adjusting filters or create your first invoice.
                </p>
                <Button className="mt-4" render={<Link to="/invoices/new" />}>
                  Create invoice
                </Button>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((inv) => (
              <TableRow
                key={inv.id}
                data-state={selected.includes(inv.id) ? "selected" : undefined}
              >
                <TableCell>
                  <Checkbox
                    checked={selected.includes(inv.id)}
                    onCheckedChange={(c) => onToggleSelect(inv.id, c)}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  <Link to={`/invoices/${inv.id}`} className="hover:underline">
                    {inv.invoiceNumber}
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="min-w-0">
                    <p className="truncate">{inv.clientName}</p>
                    {inv.clientEmail && (
                      <p className="truncate text-xs text-muted-foreground">
                        {inv.clientEmail}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {shortDate(inv.issueDate)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {shortDate(inv.dueDate)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={inv.status} />
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {money(inv.amount)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                        />
                      }
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        render={<Link to={`/invoices/${inv.id}`} />}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      {canEdit(inv.createdById) && (
                        <DropdownMenuItem
                          render={<Link to={`/invoices/${inv.id}/edit`} />}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {canDelete && (
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => onRequestDelete(inv)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Archive
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
