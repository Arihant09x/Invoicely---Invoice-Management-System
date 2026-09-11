import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { invoicesApi } from "../api/invoices.api";
import type { InvoiceQueryParams } from "@/types/invoice";

export function useExportCsv() {
  return useMutation({
    mutationFn: (params: InvoiceQueryParams) => invoicesApi.exportCsv(params),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoices-${format(new Date(), "yyyy-MM-dd-HHmm")}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("CSV downloaded");
    },
    onError: () => toast.error("Export failed"),
  });
}
