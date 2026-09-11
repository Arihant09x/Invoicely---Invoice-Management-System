"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportService = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../config/prisma");
function escapeCsv(v) {
    const s = String(v ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
}
class ExportService {
    static async exportCsv(params) {
        const where = {
            deletedAt: null,
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
        const invoices = await prisma_1.prisma.invoice.findMany({
            where,
            orderBy: { createdAt: "desc" },
            include: { items: true },
        });
        const header = [
            "id",
            "invoiceNumber",
            "clientName",
            "clientEmail",
            "status",
            "issueDate",
            "dueDate",
            "amount",
            "itemsCount",
            "createdAt",
        ];
        const lines = [
            header.join(","),
            ...invoices.map((i) => [
                i.id,
                i.invoiceNumber,
                i.clientName,
                i.clientEmail ?? "",
                i.status,
                i.issueDate.toISOString(),
                i.dueDate.toISOString(),
                i.amount.toString(),
                i.items.length,
                i.createdAt.toISOString(),
            ]
                .map(escapeCsv)
                .join(",")),
        ];
        return lines.join("\n");
    }
}
exports.ExportService = ExportService;
