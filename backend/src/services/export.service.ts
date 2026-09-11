import { InvoiceStatus, Prisma, Role } from "@prisma/client";
import { prisma } from "../config/prisma";

function escapeCsv(v: unknown) {
  const s = String(v ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export class ExportService {
  static async exportCsv(params: {
    userId: string;
    role: Role;
    q?: string;
    status?: InvoiceStatus;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const where: Prisma.InvoiceWhereInput = {
      deletedAt: null,
      ...(params.role === Role.ADMIN ? {} : { createdById: params.userId }),
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

    const invoices = await prisma.invoice.findMany({
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
      ...invoices.map((i) =>
        [
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
          .join(","),
      ),
    ];

    return lines.join("\n");
  }
}
