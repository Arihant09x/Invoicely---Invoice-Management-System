import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { invoicesApi } from "../api/invoices.api";
import { qk } from "@/lib/query-keys";
import type {
  CreateInvoiceInput,
  Invoice,
  UpdateInvoiceInput,
} from "@/types/invoice";
import type { ApiError } from "@/lib/api-client";

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateInvoiceInput) => invoicesApi.create(payload),
    onSuccess: (invoice) => {
      qc.invalidateQueries({ queryKey: qk.invoicesAll });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(`Invoice ${invoice.invoiceNumber} created`);
    },
    onError: (e: ApiError) =>
      toast.error(e.message || "Could not create invoice"),
  });
}

export function useUpdateInvoice(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateInvoiceInput) =>
      invoicesApi.update(id, payload),

    // Optimistic status/field update on the detail cache
    onMutate: async (payload) => {
      await qc.cancelQueries({ queryKey: qk.invoice(id) });
      const previous = qc.getQueryData<Invoice>(qk.invoice(id));
      if (previous) {
        qc.setQueryData<Invoice>(qk.invoice(id), {
          ...previous,
          ...payload,
        } as Invoice);
      }
      return { previous };
    },
    onError: (e: ApiError, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(qk.invoice(id), ctx.previous);
      toast.error(e.message || "Update failed");
    },
    onSuccess: () => toast.success("Invoice updated"),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.invoice(id) });
      qc.invalidateQueries({ queryKey: qk.invoicesAll });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, hard }: { id: string; hard?: boolean }) =>
      invoicesApi.remove(id, hard),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: qk.invoicesAll });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(
        vars.hard ? "Invoice permanently deleted" : "Invoice archived",
      );
    },
    onError: (e: ApiError) => toast.error(e.message || "Delete failed"),
  });
}
