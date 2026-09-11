import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { invoicesApi } from "../api/invoices.api";
import { qk } from "@/lib/query-keys";
import type { BulkInput } from "@/types/invoice";
import type { ApiError } from "@/lib/api-client";

export function useBulkActions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: BulkInput) => invoicesApi.bulk(payload),
    onSuccess: (res: { updatedCount?: number; deletedCount?: number }) => {
      qc.invalidateQueries({ queryKey: qk.invoicesAll });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      const n = res.updatedCount ?? res.deletedCount ?? 0;
      toast.success(`${n} invoice(s) processed`);
    },
    onError: (e: ApiError) => toast.error(e.message || "Bulk action failed"),
  });
}
