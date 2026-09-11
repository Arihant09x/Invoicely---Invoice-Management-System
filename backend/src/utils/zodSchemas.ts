import { z } from "zod";
import { InvoiceStatus } from "@prisma/client";

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(1),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

export const invoiceCreateSchema = z.object({
  body: z.object({
    invoiceNumber: z.string().min(1),
    clientName: z.string().min(1),
    clientEmail: z.string().email().optional(),
    issueDate: z.string().datetime().optional(), // optional; schema defaults to now()
    dueDate: z.string().datetime(), // REQUIRED in your Prisma schema
    status: z.nativeEnum(InvoiceStatus).optional(),
    notes: z.string().optional(),
    items: z
      .array(
        z.object({
          description: z.string().min(1),
          quantity: z.number().int().positive(), // Int
          unitPrice: z.number().nonnegative(),
        }),
      )
      .min(1),
  }),
});

export const invoiceUpdateSchema = z.object({
  body: z.object({
    clientName: z.string().min(1).optional(),
    clientEmail: z.string().email().optional().nullable(),
    issueDate: z.string().datetime().optional().nullable(),
    dueDate: z.string().datetime().optional(), // still required in DB but update can omit
    status: z.nativeEnum(InvoiceStatus).optional(),
    notes: z.string().optional().nullable(),
    items: z
      .array(
        z.object({
          description: z.string().min(1),
          quantity: z.number().int().positive(),
          unitPrice: z.number().nonnegative(),
        }),
      )
      .optional(),
  }),
});

export const invoiceListQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    q: z.string().optional(),
    status: z.nativeEnum(InvoiceStatus).optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
  }),
});

export const bulkSchema = z.object({
  body: z.object({
    ids: z.array(z.string()).min(1),
    action: z.enum(["UPDATE_STATUS", "DELETE_SOFT", "DELETE_HARD"]),
    status: z.nativeEnum(InvoiceStatus).optional(),
  }),
});
