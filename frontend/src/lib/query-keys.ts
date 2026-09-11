import type { InvoiceQueryParams } from "@/types/invoice";

export const qk = {
  me: ["me"] as const,
  dashboard: (params?: object) => ["dashboard", params ?? {}] as const,
  invoices: (params: InvoiceQueryParams) => ["invoices", params] as const,
  invoicesAll: ["invoices"] as const,
  invoice: (id: string) => ["invoice", id] as const,
};
