import { api } from "@/lib/api-client";
import type {
  BulkInput,
  CreateInvoiceInput,
  Invoice,
  InvoiceListResponse,
  InvoiceQueryParams,
  UpdateInvoiceInput,
} from "@/types/invoice";

const clean = (p: object) =>
  Object.fromEntries(
    Object.entries(p).filter(
      ([, v]) => v !== undefined && v !== "" && v !== null,
    ),
  );

export const invoicesApi = {
  list: async (params: InvoiceQueryParams) =>
    (await api.get<InvoiceListResponse>("/invoices", { params: clean(params) }))
      .data,

  byId: async (id: string) =>
    (await api.get<{ invoice: Invoice }>(`/invoices/${id}`)).data.invoice,

  create: async (payload: CreateInvoiceInput) =>
    (await api.post<{ invoice: Invoice }>("/invoices", payload)).data.invoice,

  update: async (id: string, payload: UpdateInvoiceInput) =>
    (await api.patch<{ invoice: Invoice }>(`/invoices/${id}`, payload)).data
      .invoice,

  remove: async (id: string, hard = false) =>
    (
      await api.delete(`/invoices/${id}`, {
        params: hard ? { hard: "true" } : {},
      })
    ).data,

  bulk: async (payload: BulkInput) =>
    (await api.post("/invoices/bulk", payload)).data,

  exportCsv: async (params: InvoiceQueryParams) => {
    const res = await api.get("/invoices/export", {
      params: clean(params),
      responseType: "blob",
    });
    return res.data as Blob;
  },
};
