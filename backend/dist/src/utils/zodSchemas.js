"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkSchema = exports.invoiceListQuerySchema = exports.invoiceUpdateSchema = exports.invoiceCreateSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(8),
        name: zod_1.z.string().min(1),
    }),
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(1),
    }),
});
exports.invoiceCreateSchema = zod_1.z.object({
    body: zod_1.z.object({
        invoiceNumber: zod_1.z.string().min(1),
        clientName: zod_1.z.string().min(1),
        clientEmail: zod_1.z.string().email().optional(),
        issueDate: zod_1.z.string().datetime().optional(), // optional; schema defaults to now()
        dueDate: zod_1.z.string().datetime(), // REQUIRED in your Prisma schema
        status: zod_1.z.nativeEnum(client_1.InvoiceStatus).optional(),
        notes: zod_1.z.string().optional(),
        items: zod_1.z
            .array(zod_1.z.object({
            description: zod_1.z.string().min(1),
            quantity: zod_1.z.number().int().positive(), // Int
            unitPrice: zod_1.z.number().nonnegative(),
        }))
            .min(1),
    }),
});
exports.invoiceUpdateSchema = zod_1.z.object({
    body: zod_1.z.object({
        clientName: zod_1.z.string().min(1).optional(),
        clientEmail: zod_1.z.string().email().optional().nullable(),
        issueDate: zod_1.z.string().datetime().optional().nullable(),
        dueDate: zod_1.z.string().datetime().optional(), // still required in DB but update can omit
        status: zod_1.z.nativeEnum(client_1.InvoiceStatus).optional(),
        notes: zod_1.z.string().optional().nullable(),
        items: zod_1.z
            .array(zod_1.z.object({
            description: zod_1.z.string().min(1),
            quantity: zod_1.z.number().int().positive(),
            unitPrice: zod_1.z.number().nonnegative(),
        }))
            .optional(),
    }),
});
exports.invoiceListQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().optional(),
        limit: zod_1.z.string().optional(),
        sortBy: zod_1.z.string().optional(),
        sortOrder: zod_1.z.enum(["asc", "desc"]).optional(),
        q: zod_1.z.string().optional(),
        status: zod_1.z.nativeEnum(client_1.InvoiceStatus).optional(),
        dateFrom: zod_1.z.string().optional(),
        dateTo: zod_1.z.string().optional(),
    }),
});
exports.bulkSchema = zod_1.z.object({
    body: zod_1.z.object({
        ids: zod_1.z.array(zod_1.z.string()).min(1),
        action: zod_1.z.enum(["UPDATE_STATUS", "DELETE_SOFT", "DELETE_HARD"]),
        status: zod_1.z.nativeEnum(client_1.InvoiceStatus).optional(),
    }),
});
