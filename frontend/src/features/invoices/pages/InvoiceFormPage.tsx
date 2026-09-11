import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { Loader2 } from "lucide-react";

import { useInvoice } from "../hooks/useInvoice";
import {
  useCreateInvoice,
  useUpdateInvoice,
} from "../hooks/useInvoiceMutations";
import { LineItemsField } from "../components/LineItemsField";
import type { InvoiceStatus } from "@/types/invoice";
import { INVOICE_STATUSES } from "@/types/invoice";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const schema = z
  .object({
    invoiceNumber: z.string().min(1, "Required"),
    clientName: z.string().min(1, "Required"),
    clientEmail: z.string().email("Invalid email").or(z.literal("")),
    issueDate: z.string().min(1, "Required"),
    dueDate: z.string().min(1, "Required"),
    status: z.enum(INVOICE_STATUSES as [InvoiceStatus, ...InvoiceStatus[]]),
    notes: z.string().default(""),
    items: z
      .array(
        z.object({
          description: z.string().min(1, "Required"),
          quantity: z.coerce.number().int().positive("Must be > 0"),
          unitPrice: z.coerce.number().nonnegative("Must be ≥ 0"),
        }),
      )
      .min(1, "At least one line item"),
  })
  .refine((v) => new Date(v.dueDate) >= new Date(v.issueDate), {
    path: ["dueDate"],
    message: "Due date must be after issue date",
  });

type FormValues = z.infer<typeof schema>;

export default function InvoiceFormPage({ mode }: { mode: "create" | "edit" }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: existing, isLoading } = useInvoice(
    mode === "edit" ? id : undefined,
  );

  const create = useCreateInvoice();
  const update = useUpdateInvoice(id ?? "");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<FormValues>,
    defaultValues: {
      invoiceNumber: "",
      clientName: "",
      clientEmail: "",
      issueDate: format(new Date(), "yyyy-MM-dd"),
      dueDate: format(new Date(Date.now() + 14 * 864e5), "yyyy-MM-dd"),
      status: "PENDING",
      notes: "",
      items: [{ description: "", quantity: 1, unitPrice: 0 }],
    },
  });

  // Hydrate the form when editing an existing invoice.
  useEffect(() => {
    if (mode === "edit" && existing) {
      form.reset({
        invoiceNumber: existing.invoiceNumber,
        clientName: existing.clientName,
        clientEmail: existing.clientEmail ?? "",
        issueDate: format(parseISO(existing.issueDate), "yyyy-MM-dd"),
        dueDate: format(parseISO(existing.dueDate), "yyyy-MM-dd"),
        status: existing.status,
        notes: existing.notes ?? "",
        items: existing.items.map((i) => ({
          description: i.description,
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
        })),
      });
    }
  }, [existing, mode, form]);
const onSubmit = (values: FormValues) => {
    const payload = {
      clientName: values.clientName,
      clientEmail: values.clientEmail || undefined,
      issueDate: new Date(values.issueDate).toISOString(),
      dueDate: new Date(values.dueDate).toISOString(),
      status: values.status,
      notes: values.notes || undefined,
      items: values.items,
    };

    if (mode === "create") {
      create.mutate(
        { ...payload, invoiceNumber: values.invoiceNumber },
        { onSuccess: (inv) => navigate(`/invoices/${inv.id}`) },
      );
    } else {
      update.mutate(payload, { onSuccess: () => navigate(`/invoices/${id}`) });
    }
  };

  if (mode === "edit" && isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  const pending = create.isPending || update.isPending;

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="mx-auto max-w-4xl space-y-5"
    >
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {mode === "create"
            ? "Create invoice"
            : `Edit ${existing?.invoiceNumber ?? ""}`}
        </h1>
        <p className="text-sm text-muted-foreground">
          Line totals are calculated automatically.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Invoice details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Invoice number</Label>
            <Input
              placeholder="INV-0001"
              disabled={mode === "edit"}
              {...form.register("invoiceNumber")}
            />
            {form.formState.errors.invoiceNumber && (
              <p className="text-xs text-destructive">
                {form.formState.errors.invoiceNumber.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={form.watch("status")}
              onValueChange={(v) => form.setValue("status", v as never)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INVOICE_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Client name</Label>
            <Input placeholder="Acme Corp" {...form.register("clientName")} />
            {form.formState.errors.clientName && (
              <p className="text-xs text-destructive">
                {form.formState.errors.clientName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Client email</Label>
            <Input
              type="email"
              placeholder="billing@acme.com"
              {...form.register("clientEmail")}
            />
            {form.formState.errors.clientEmail && (
              <p className="text-xs text-destructive">
                {form.formState.errors.clientEmail.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Issue date</Label>
            <Input type="date" {...form.register("issueDate")} />
          </div>

          <div className="space-y-2">
            <Label>Due date</Label>
            <Input type="date" {...form.register("dueDate")} />
            {form.formState.errors.dueDate && (
              <p className="text-xs text-destructive">
                {form.formState.errors.dueDate.message}
              </p>
            )}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>Notes</Label>
            <Textarea
              rows={3}
              placeholder="Payment terms, PO reference..."
              {...form.register("notes")}
            />
          </div>
        </CardContent>
      </Card>

      <LineItemsField form={form} />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === "create" ? "Create invoice" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}