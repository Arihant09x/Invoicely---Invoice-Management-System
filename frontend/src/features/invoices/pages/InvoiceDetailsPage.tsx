import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Download, Pencil, Printer, Trash2 } from "lucide-react";

import { useInvoice } from "../hooks/useInvoice";
import { useDeleteInvoice } from "../hooks/useInvoiceMutations";
import { DeleteInvoiceDialog } from "../components/DeleteInvoiceDialog";
import { InvoicePdf } from "../components/InvoicePdf";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { money, shortDate } from "@/lib/format";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function InvoiceDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: invoice, isLoading, isError } = useInvoice(id);
  const { isAdmin, user } = useAuth();
  const del = useDeleteInvoice();
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (isError || !invoice) {
    return (
      <Card className="p-10 text-center">
        <p className="font-medium">Invoice not found</p>
        <Button className="mt-4" render={<Link to="/invoices" />}>
          Back to invoices
        </Button>
      </Card>
    );
  }

  const canEdit = isAdmin || invoice.createdById === user?.id;
  const subtotal = invoice.items.reduce((s, i) => s + Number(i.amount), 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Button variant="ghost" size="sm" render={<Link to="/invoices" />}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </Button>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <InvoicePdf invoice={invoice}>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Save as PDF
            </Button>
          </InvoicePdf>
          {canEdit && (
            <Button
              size="sm"
              render={<Link to={`/invoices/${invoice.id}/edit`} />}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
          {isAdmin && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Archive
            </Button>
          )}
        </div>
      </div>

      {/* Printable area */}
      <div id="invoice-print" className="space-y-5">
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 space-y-0">
            <div>
              <CardTitle className="text-2xl tracking-tight">
                {invoice.invoiceNumber}
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Issued {shortDate(invoice.issueDate)}
              </p>
            </div>
            <p className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              {invoice.status}
            </p>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Billed to
              </p>
              <p className="mt-1 font-medium">{invoice.clientName}</p>
              {invoice.clientEmail && (
                <p className="text-sm text-muted-foreground">
                  {invoice.clientEmail}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Due date
                </p>
                <p className="mt-1 font-medium">{shortDate(invoice.dueDate)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Created by
                </p>
                <p className="mt-1 font-medium">
                  {invoice.createdBy?.name ?? invoice.createdBy?.email ?? "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
<CardHeader className="pb-2">
            <CardTitle className="text-base">Line items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit price</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.description}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {money(item.unitPrice)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {money(item.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {invoice.notes && (
              <div className="mt-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Notes
                </p>
                <p className="mt-1 text-sm">{invoice.notes}</p>
              </div>
            )}

            <Separator className="my-4" />
            <div className="ml-auto max-w-xs space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="tabular-nums">{money(subtotal)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span className="tabular-nums">{money(invoice.amount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <DeleteInvoiceDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        invoiceNumber={invoice.invoiceNumber}
        pending={del.isPending}
        onConfirm={() =>
          del.mutate(
            { id: invoice.id },
            { onSuccess: () => navigate("/invoices") },
          )
        }
      />
    </div>
  );
}