import { InvoiceStatus, Role, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/appError";
import { httpStatus } from "../utils/httpStatus";

function lineAmount(quantity: number, unitPrice: number) {
  return quantity * unitPrice;
}
function invoiceAmount(items: Array<{ quantity: number; unitPrice: number }>) {
  return items.reduce((sum, i) => sum + lineAmount(i.quantity, i.unitPrice), 0);
}

export class InvoiceService {
  static async list(params: {
    userId: string;
    role: Role;
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
    q?: string;
    status?: InvoiceStatus;
    dateFrom?: string;
    dateTo?: string;
    includeDeleted?: boolean; // optional (if you want)
  }) {
    const where: Prisma.InvoiceWhereInput = {
      ...(params.includeDeleted ? {} : { deletedAt: null }),
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

    const allowedSort: Record<string, Prisma.InvoiceOrderByWithRelationInput> =
      {
        createdAt: { createdAt: params.sortOrder },
        dueDate: { dueDate: params.sortOrder },
        issueDate: { issueDate: params.sortOrder },
        invoiceNumber: { invoiceNumber: params.sortOrder },
        amount: { amount: params.sortOrder },
        status: { status: params.sortOrder },
      };
    const orderBy = allowedSort[params.sortBy] ?? { createdAt: "desc" };

    const [total, data] = await prisma.$transaction([
      prisma.invoice.count({ where }),
      prisma.invoice.findMany({
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

  static async getById(params: {
    id: string;
    userId: string;
    role: Role;
    includeDeleted?: boolean;
  }) {
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: params.id,
        ...(params.includeDeleted ? {} : { deletedAt: null }),
        ...(params.role === Role.ADMIN ? {} : { createdById: params.userId }),
      },
      include: {
        items: true,
        createdBy: { select: { id: true, email: true, name: true } },
      },
    });

    if (!invoice) throw new AppError("Invoice not found", httpStatus.NOT_FOUND);
    return invoice;
  }

  static async create(params: {
    userId: string;
    input: {
      invoiceNumber: string;
      clientName: string;
      clientEmail?: string;
      issueDate?: string;
      dueDate: string;
      status?: InvoiceStatus;
      notes?: string;
      items: Array<{
        description: string;
        quantity: number;
        unitPrice: number;
      }>;
    };
  }) {
    const amount = invoiceAmount(params.input.items);

    const created = await prisma.invoice.create({
      data: {
        createdById: params.userId,
        invoiceNumber: params.input.invoiceNumber,
        clientName: params.input.clientName,
        clientEmail: params.input.clientEmail ?? null,
        issueDate: params.input.issueDate
          ? new Date(params.input.issueDate)
          : new Date(),
        dueDate: new Date(params.input.dueDate),
        status: params.input.status ?? InvoiceStatus.PENDING,
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

  static async update(params: {
    id: string;
    userId: string;
    role: Role;
    input: {
      clientName?: string;
      clientEmail?: string | null;
      issueDate?: string | null;
      dueDate?: string;
      status?: InvoiceStatus;
      notes?: string | null;
      items?: Array<{
        description: string;
        quantity: number;
        unitPrice: number;
      }>;
    };
  }) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: { items: true },
    });
    if (!invoice || invoice.deletedAt)
      throw new AppError("Invoice not found", httpStatus.NOT_FOUND);

    const isOwner = invoice.createdById === params.userId;
    if (!isOwner && params.role !== Role.ADMIN)
      throw new AppError("Forbidden", httpStatus.FORBIDDEN);

    const data: Prisma.InvoiceUpdateInput = {
      clientName: params.input.clientName ?? undefined,
      clientEmail:
        params.input.clientEmail === undefined
          ? undefined
          : params.input.clientEmail,
      issueDate:
        params.input.issueDate === undefined
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

    return prisma.invoice.update({
      where: { id: invoice.id },
      data,
      include: { items: true },
    });
  }

  static async deleteSoft(params: { id: string }) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
    });
    if (!invoice || invoice.deletedAt)
      throw new AppError("Invoice not found", httpStatus.NOT_FOUND);

    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { deletedAt: new Date() },
    });

    return { deleted: true, mode: "soft" as const };
  }

  static async deleteHard(params: { id: string }) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
    });
    if (!invoice) throw new AppError("Invoice not found", httpStatus.NOT_FOUND);

    await prisma.invoiceItem.deleteMany({ where: { invoiceId: invoice.id } });
    await prisma.invoice.delete({ where: { id: invoice.id } });

    return { deleted: true, mode: "hard" as const };
  }

  static async bulk(params: {
    ids: string[];
    userId: string;
    role: Role;
    action: "UPDATE_STATUS" | "DELETE_SOFT" | "DELETE_HARD";
    status?: InvoiceStatus;
  }) {
    const whereBase: Prisma.InvoiceWhereInput =
      params.role === Role.ADMIN
        ? { id: { in: params.ids } }
        : { id: { in: params.ids }, createdById: params.userId };

    if (params.action === "UPDATE_STATUS") {
      if (!params.status)
        throw new AppError(
          "status is required for UPDATE_STATUS",
          httpStatus.BAD_REQUEST,
        );
      const result = await prisma.invoice.updateMany({
        where: { ...whereBase, deletedAt: null },
        data: { status: params.status },
      });
      return { updatedCount: result.count };
    }

    if (params.action === "DELETE_SOFT") {
      const result = await prisma.invoice.updateMany({
        where: { ...whereBase, deletedAt: null },
        data: { deletedAt: new Date() },
      });
      return { deletedCount: result.count, mode: "soft" as const };
    }

    // DELETE_HARD
    const invoices = await prisma.invoice.findMany({ where: whereBase });
    const invoiceIds = invoices.map((i) => i.id);

    await prisma.invoiceItem.deleteMany({
      where: { invoiceId: { in: invoiceIds } },
    });
    const result = await prisma.invoice.deleteMany({
      where: { id: { in: invoiceIds } },
    });

    return { deletedCount: result.count, mode: "hard" as const };
  }
}
