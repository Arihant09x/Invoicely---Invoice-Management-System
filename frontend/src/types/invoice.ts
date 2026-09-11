export type InvoiceStatus =
  | "DRAFT"
  | "PENDING"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";

export const INVOICE_STATUSES: InvoiceStatus[] = [
  "DRAFT",
  "PENDING",
  "PAID",
  "OVERDUE",
  "CANCELLED",
];

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: string | number; // Prisma Decimal serializes as string
  amount: string | number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string | null;
  amount: string | number;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  notes: string | null;
  createdById: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: InvoiceItem[];
  createdBy?: { id: string; email: string; name: string | null };
}

export interface InvoiceListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface InvoiceListResponse {
  meta: InvoiceListMeta;
  data: Invoice[];
}

export interface InvoiceQueryParams {
  page?: number;
  limit?: number;
  sortBy?:
    | "createdAt"
    | "dueDate"
    | "issueDate"
    | "invoiceNumber"
    | "amount"
    | "status";
  sortOrder?: "asc" | "desc";
  q?: string;
  status?: InvoiceStatus;
  dateFrom?: string;
  dateTo?: string;
}

export interface InvoiceItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateInvoiceInput {
  invoiceNumber: string;
  clientName: string;
  clientEmail?: string;
  issueDate?: string;
  dueDate: string;
  status?: InvoiceStatus;
  notes?: string;
  items: InvoiceItemInput[];
}

export type UpdateInvoiceInput = Partial<
  Omit<CreateInvoiceInput, "invoiceNumber">
>;

export type BulkAction = "UPDATE_STATUS" | "DELETE_SOFT" | "DELETE_HARD";

export interface BulkInput {
  ids: string[];
  action: BulkAction;
  status?: InvoiceStatus;
}
