"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../config/prisma");
function toDateOrDefault(v, fallback) {
    if (!v)
        return fallback;
    const d = new Date(String(v));
    return Number.isNaN(d.getTime()) ? fallback : d;
}
function groupExpression(groupBy) {
    // Postgres date_trunc units: 'day' | 'week' | 'month'
    return groupBy;
}
class DashboardService {
    static async overview(params) {
        const now = new Date();
        const defaultFrom = new Date(now);
        defaultFrom.setDate(defaultFrom.getDate() - 30);
        const from = toDateOrDefault(params.dateFrom, defaultFrom);
        const to = toDateOrDefault(params.dateTo, now);
        const groupBy = params.groupBy ?? "day";
        const whereBase = {
            deletedAt: null,
            ...(params.role === client_1.Role.ADMIN ? {} : { createdById: params.userId }),
            issueDate: { gte: from, lte: to },
        };
        // KPIs + status counts
        const kpiByStatus = await prisma_1.prisma.invoice.groupBy({
            by: ["status"],
            where: whereBase,
            _count: { _all: true },
            _sum: { amount: true },
            _avg: { amount: true },
        });
        const byStatusCount = {};
        const byStatusAmount = {};
        for (const row of kpiByStatus) {
            byStatusCount[row.status] = row._count._all;
            byStatusAmount[row.status] = row._sum.amount
                ? Number(row._sum.amount)
                : 0;
        }
        const totalInvoices = Object.values(byStatusCount).reduce((a, b) => a + b, 0);
        const totalRevenue = byStatusAmount[client_1.InvoiceStatus.PAID] ?? 0;
        const overdueAmount = byStatusAmount[client_1.InvoiceStatus.OVERDUE] ?? 0;
        const outstandingAmount = (byStatusAmount[client_1.InvoiceStatus.PENDING] ?? 0) +
            (byStatusAmount[client_1.InvoiceStatus.OVERDUE] ?? 0);
        const avgInvoiceValue = kpiByStatus.length > 0
            ? Number((kpiByStatus.reduce((s, r) => s + (r._avg.amount ? Number(r._avg.amount) : 0), 0) / kpiByStatus.length).toFixed(2))
            : 0;
        // ✅ Build the reusable user filter using Prisma.sql (parameterized)
        const userFilter = params.role === client_1.Role.ADMIN
            ? client_1.Prisma.empty
            : client_1.Prisma.sql `AND "createdById" = ${params.userId}`;
        // Time series for charts
        const unit = groupExpression(groupBy);
        const timeSeries = await prisma_1.prisma.$queryRaw(client_1.Prisma.sql `
      SELECT
        date_trunc(${unit}, "issueDate") AS bucket,
        COUNT(*)::bigint AS invoices_count,
        COALESCE(SUM(CASE WHEN status = 'PAID' THEN amount ELSE 0 END), 0) AS revenue_paid,
        COALESCE(SUM(CASE WHEN status IN ('PENDING','OVERDUE') THEN amount ELSE 0 END), 0) AS outstanding
      FROM "Invoice"
      WHERE
        "deletedAt" IS NULL
        AND "issueDate" >= ${from}
        AND "issueDate" <= ${to}
        ${userFilter}
      GROUP BY 1
      ORDER BY 1 ASC
    `);
        // Overdue aging buckets
        const aging = await prisma_1.prisma.$queryRaw(client_1.Prisma.sql `
      SELECT
        CASE
          WHEN (NOW()::date - "dueDate"::date) BETWEEN 0 AND 7 THEN '0-7'
          WHEN (NOW()::date - "dueDate"::date) BETWEEN 8 AND 15 THEN '8-15'
          WHEN (NOW()::date - "dueDate"::date) BETWEEN 16 AND 30 THEN '16-30'
          ELSE '31+'
        END AS bucket,
        COUNT(*)::bigint AS count,
        COALESCE(SUM(amount), 0) AS amount
      FROM "Invoice"
      WHERE
        "deletedAt" IS NULL
        AND status = 'OVERDUE'
        AND "dueDate" < NOW()
        ${userFilter}
      GROUP BY 1
      ORDER BY 1
    `);
        // Recent invoices
        const recentInvoices = await prisma_1.prisma.invoice.findMany({
            where: {
                deletedAt: null,
                ...(params.role === client_1.Role.ADMIN ? {} : { createdById: params.userId }),
            },
            orderBy: { createdAt: "desc" },
            take: 10,
            select: {
                id: true,
                invoiceNumber: true,
                clientName: true,
                status: true,
                amount: true,
                issueDate: true,
                dueDate: true,
                createdAt: true,
            },
        });
        // Overdue invoices
        const overdueInvoices = await prisma_1.prisma.invoice.findMany({
            where: {
                deletedAt: null,
                status: client_1.InvoiceStatus.OVERDUE,
                dueDate: { lt: new Date() },
                ...(params.role === client_1.Role.ADMIN ? {} : { createdById: params.userId }),
            },
            orderBy: { dueDate: "asc" },
            take: 10,
            select: {
                id: true,
                invoiceNumber: true,
                clientName: true,
                amount: true,
                dueDate: true,
            },
        });
        // Top clients by outstanding
        const topClients = await prisma_1.prisma.$queryRaw(client_1.Prisma.sql `
      SELECT
        "clientName",
        COALESCE(SUM(amount),0) AS outstanding,
        COUNT(*)::bigint AS invoices
      FROM "Invoice"
      WHERE
        "deletedAt" IS NULL
        AND status IN ('PENDING','OVERDUE')
        ${userFilter}
      GROUP BY "clientName"
      ORDER BY outstanding DESC
      LIMIT 10
    `);
        return {
            range: { from: from.toISOString(), to: to.toISOString(), groupBy },
            kpis: {
                totalInvoices,
                paidInvoices: byStatusCount[client_1.InvoiceStatus.PAID] ?? 0,
                pendingInvoices: byStatusCount[client_1.InvoiceStatus.PENDING] ?? 0,
                overdueInvoices: byStatusCount[client_1.InvoiceStatus.OVERDUE] ?? 0,
                draftInvoices: byStatusCount[client_1.InvoiceStatus.DRAFT] ?? 0,
                cancelledInvoices: byStatusCount[client_1.InvoiceStatus.CANCELLED] ?? 0,
                totalRevenue,
                outstandingAmount,
                overdueAmount,
                avgInvoiceValue,
            },
            breakdowns: {
                statusCounts: byStatusCount,
                statusAmounts: byStatusAmount,
                overdueAging: aging.map((a) => ({
                    bucket: a.bucket,
                    count: Number(a.count),
                    amount: Number(a.amount),
                })),
            },
            charts: {
                timeSeries: timeSeries.map((t) => ({
                    bucket: t.bucket.toISOString(),
                    invoicesCount: Number(t.invoices_count),
                    revenuePaid: Number(t.revenue_paid),
                    outstanding: Number(t.outstanding),
                })),
            },
            tables: {
                recentInvoices: recentInvoices.map((i) => ({
                    ...i,
                    amount: Number(i.amount),
                })),
                overdueInvoices: overdueInvoices.map((i) => ({
                    ...i,
                    amount: Number(i.amount),
                })),
                topClients: topClients.map((c) => ({
                    clientName: c.clientName,
                    outstanding: Number(c.outstanding),
                    invoices: Number(c.invoices),
                })),
            },
        };
    }
}
exports.DashboardService = DashboardService;
