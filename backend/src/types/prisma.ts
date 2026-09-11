export const Role = {
  ADMIN: "ADMIN",
  USER: "USER",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const InvoiceStatus = {
  DRAFT: "DRAFT",
  PENDING: "PENDING",
  PAID: "PAID",
  OVERDUE: "OVERDUE",
  CANCELLED: "CANCELLED",
} as const;
export type InvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus];

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string | null;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string | null;
  amount: string; // Decimal serialized as string by Prisma
  status: InvoiceStatus;
  issueDate: Date;
  dueDate: Date;
  notes: string | null;
  createdById: string;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: string; // Decimal → string
  amount: string; // Decimal → string
}
