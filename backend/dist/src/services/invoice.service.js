"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceService = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../config/prisma");
const appError_1 = require("../utils/appError");
const httpStatus_1 = require("../utils/httpStatus");
function lineAmount(quantity, unitPrice) {
    return quantity * unitPrice;
}
function invoiceAmount(items) {
    return items.reduce((sum, i) => sum + lineAmount(i.quantity, i.unitPrice), 0);
}
class InvoiceService {
    static async list(params) {
        const where = {
            ...(params.includeDeleted ? {} : { deletedAt: null }),
            ...(params.role === client_1.Role.ADMIN ? {} : { createdById: params.userId }),
            ...(params.q
                ? {
                    OR: [
                        { invoiceNumber: { contains: params.q, mode: "insensitive" } },
                        { clientName: { contains: params.q, mode: "insensitive" } },
                    ],
                }
                : {}),
            ...(params.status ? { status: params.status } : {}),
            ...(params.dateFrom || params.dateTo
                ? {
                    issueDate: {
                        ...(params.dateFrom ? { gte: new Date(params.dateFrom) } : {}),
                        ...(params.dateTo ? { lte: new Date(params.dateTo) } : {}),
                    },
                }
                : {}),
        };
        const allowedSort = {
            createdAt: { createdAt: params.sortOrder },
            dueDate: { dueDate: params.sortOrder },
            issueDate: { issueDate: params.sortOrder },
            invoiceNumber: { invoiceNumber: params.sortOrder },
            amount: { amount: params.sortOrder },
            status: { status: params.sortOrder },
        };
        const orderBy = allowedSort[params.sortBy] ?? { createdAt: "desc" };
        const [total, data] = await prisma_1.prisma.$transaction([
            prisma_1.prisma.invoice.count({ where }),
            prisma_1.prisma.invoice.findMany({
                where,
                orderBy,
                skip: (params.page - 1) * params.limit,
                take: params.limit,
                include: { items: true },
            }),
        ]);
        return {
            meta: {
                page: params.page,
                limit: params.limit,
                total,
                totalPages: Math.ceil(total / params.limit),
            },
            data,
        };
    }
    static async getById(params) {
        const invoice = await prisma_1.prisma.invoice.findFirst({
            where: {
                id: params.id,
                ...(params.includeDeleted ? {} : { deletedAt: null }),
                ...(params.role === client_1.Role.ADMIN ? {} : { createdById: params.userId }),
            },
            include: {
                items: true,
                createdBy: { select: { id: true, email: true, name: true } },
            },
        });
        if (!invoice)
            throw new appError_1.AppError("Invoice not found", httpStatus_1.httpStatus.NOT_FOUND);
        return invoice;
    }
    static async create(params) {
        const amount = invoiceAmount(params.input.items);
        const created = await prisma_1.prisma.invoice.create({
            data: {
                createdById: params.userId,
                invoiceNumber: params.input.invoiceNumber,
                clientName: params.input.clientName,
                clientEmail: params.input.clientEmail ?? null,
                issueDate: params.input.issueDate
                    ? new Date(params.input.issueDate)
                    : new Date(),
                dueDate: new Date(params.input.dueDate),
                status: params.input.status ?? client_1.InvoiceStatus.PENDING,
                notes: params.input.notes ?? null,
                amount,
                items: {
                    create: params.input.items.map((i) => ({
                        description: i.description,
                        quantity: i.quantity,
                        unitPrice: i.unitPrice,
                        amount: lineAmount(i.quantity, i.unitPrice),
                    })),
                },
            },
            include: { items: true },
        });
        return created;
    }
    static async update(params) {
        const invoice = await prisma_1.prisma.invoice.findUnique({
            where: { id: params.id },
            include: { items: true },
        });
        if (!invoice || invoice.deletedAt)
            throw new appError_1.AppError("Invoice not found", httpStatus_1.httpStatus.NOT_FOUND);
        const isOwner = invoice.createdById === params.userId;
        if (!isOwner && params.role !== client_1.Role.ADMIN)
            throw new appError_1.AppError("Forbidden", httpStatus_1.httpStatus.FORBIDDEN);
        const data = {
            clientName: params.input.clientName ?? undefined,
            clientEmail: params.input.clientEmail === undefined
                ? undefined
                : params.input.clientEmail,
            issueDate: params.input.issueDate === undefined
                ? undefined
                : params.input.issueDate
                    ? new Date(params.input.issueDate)
                    : undefined,
            dueDate: params.input.dueDate
                ? new Date(params.input.dueDate)
                : undefined,
            status: params.input.status ?? undefined,
            notes: params.input.notes === undefined ? undefined : params.input.notes,
        };
        if (params.input.items) {
            const amount = invoiceAmount(params.input.items);
            data.amount = amount;
            data.items = {
                deleteMany: { invoiceId: invoice.id },
                create: params.input.items.map((i) => ({
                    description: i.description,
                    quantity: i.quantity,
                    unitPrice: i.unitPrice,
                    amount: lineAmount(i.quantity, i.unitPrice),
                })),
            };
        }
        return prisma_1.prisma.invoice.update({
            where: { id: invoice.id },
            data,
            include: { items: true },
        });
    }
    static async deleteSoft(params) {
        const invoice = await prisma_1.prisma.invoice.findUnique({
            where: { id: params.id },
        });
        if (!invoice || invoice.deletedAt)
            throw new appError_1.AppError("Invoice not found", httpStatus_1.httpStatus.NOT_FOUND);
        await prisma_1.prisma.invoice.update({
            where: { id: invoice.id },
            data: { deletedAt: new Date() },
        });
        return { deleted: true, mode: "soft" };
    }
    static async deleteHard(params) {
        const invoice = await prisma_1.prisma.invoice.findUnique({
            where: { id: params.id },
        });
        if (!invoice)
            throw new appError_1.AppError("Invoice not found", httpStatus_1.httpStatus.NOT_FOUND);
        await prisma_1.prisma.invoiceItem.deleteMany({ where: { invoiceId: invoice.id } });
        await prisma_1.prisma.invoice.delete({ where: { id: invoice.id } });
        return { deleted: true, mode: "hard" };
    }
    static async bulk(params) {
        const whereBase = params.role === client_1.Role.ADMIN
            ? { id: { in: params.ids } }
            : { id: { in: params.ids }, createdById: params.userId };
        if (params.action === "UPDATE_STATUS") {
            if (!params.status)
                throw new appError_1.AppError("status is required for UPDATE_STATUS", httpStatus_1.httpStatus.BAD_REQUEST);
            const result = await prisma_1.prisma.invoice.updateMany({
                where: { ...whereBase, deletedAt: null },
                data: { status: params.status },
            });
            return { updatedCount: result.count };
        }
        if (params.action === "DELETE_SOFT") {
            const result = await prisma_1.prisma.invoice.updateMany({
                where: { ...whereBase, deletedAt: null },
                data: { deletedAt: new Date() },
            });
            return { deletedCount: result.count, mode: "soft" };
        }
        // DELETE_HARD
        const invoices = await prisma_1.prisma.invoice.findMany({ where: whereBase });
        const invoiceIds = invoices.map((i) => i.id);
        await prisma_1.prisma.invoiceItem.deleteMany({
            where: { invoiceId: { in: invoiceIds } },
        });
        const result = await prisma_1.prisma.invoice.deleteMany({
            where: { id: { in: invoiceIds } },
        });
        return { deletedCount: result.count, mode: "hard" };
    }
}
exports.InvoiceService = InvoiceService;
