import { useQuery } from "@tanstack/react-query";
import { invoicesApi } from "../api/invoices.api";
import { qk } from "@/lib/query-keys";

export function useInvoice(id?: string) {
  return useQuery({
    queryKey: qk.invoice(id ?? ""),
    queryFn: () => invoicesApi.byId(id ?? ""),
    enabled: Boolean(id),
  });
}
