import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { invoicesApi } from "../api/invoices.api";
import { qk } from "@/lib/query-keys";
import type { InvoiceQueryParams } from "@/types/invoice";

export function useInvoices(params: InvoiceQueryParams) {
  return useQuery({
    queryKey: qk.invoices(params),
    queryFn: () => invoicesApi.list(params),
    placeholderData: keepPreviousData, // smooth pagination, no flash
  });
}
