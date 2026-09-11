"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
// ✅ Each const gets a matching type alias so it works as BOTH value and type
const Role = {
    ADMIN: "ADMIN",
    USER: "USER",
};
const InvoiceStatus = {
    DRAFT: "DRAFT",
    PENDING: "PENDING",
    PAID: "PAID",
    OVERDUE: "OVERDUE",
    CANCELLED: "CANCELLED",
};
async function upsertUser(email, name, pw, role) {
    const passwordHash = await bcryptjs_1.default.hash(pw, 10);
    return prisma.user.upsert({
        where: { email },
        update: { name, role },
        create: { email, name, passwordHash, role },
    });
}
async function main() {
    console.log("Seeding...");
    const user = await upsertUser("user@example.com", "Demo User", "Password123!", Role.USER);
    const admin = await upsertUser("admin@example.com", "Admin User", "Admin123!", Role.ADMIN);
    const ids = {
        [user.email]: user.id,
        [admin.email]: admin.id,
    };
    const invoices = [
        {
            n: "INV-9001",
            o: user.email,
            cn: "Acme Corp",
            ce: "billing@acme.com",
            is: "2026-09-09T00:00:00.000Z",
            du: "2026-09-20T00:00:00.000Z",
            st: InvoiceStatus.PENDING,
            no: "Net 11",
            items: [
                { d: "Design work", q: 2, p: 150 },
                { d: "Dev work", q: 5, p: 120 },
            ],
        },
        {
            n: "INV-9002",
            o: user.email,
            cn: "Globex Inc",
            ce: "accounts@globex.com",
            is: "2026-08-15T00:00:00.000Z",
            du: "2026-08-30T00:00:00.000Z",
            st: InvoiceStatus.PAID,
            no: "Bank transfer",
            items: [
                { d: "API integration", q: 10, p: 95 },
                { d: "QA + bugfixes", q: 4, p: 80 },
            ],
        },
        {
            n: "INV-9003",
            o: user.email,
            cn: "Soylent Co",
            ce: "finance@soylent.co",
            is: "2026-07-01T00:00:00.000Z",
            du: "2026-07-10T00:00:00.000Z",
            st: InvoiceStatus.OVERDUE,
            no: "Reminder x2",
            items: [{ d: "Consulting (hrs)", q: 8, p: 200 }],
        },
        {
            n: "INV-9004",
            o: user.email,
            cn: "Initech LLC",
            ce: "billing@initech.io",
            is: "2026-09-10T00:00:00.000Z",
            du: "2026-09-25T00:00:00.000Z",
            st: InvoiceStatus.DRAFT,
            no: "Draft",
            items: [{ d: "UI polish", q: 3, p: 110 }],
        },
        {
            n: "INV-9101",
            o: admin.email,
            cn: "Umbrella Corp",
            ce: "payables@umbrella.com",
            is: "2026-09-05T00:00:00.000Z",
            du: "2026-09-19T00:00:00.000Z",
            st: InvoiceStatus.PENDING,
            no: "Admin demo",
            items: [
                { d: "Security audit", q: 1, p: 1500 },
                { d: "Pen-test report", q: 1, p: 900 },
            ],
        },
        {
            n: "INV-9102",
            o: admin.email,
            cn: "Hooli Systems",
            ce: "finance@hooli.com",
            is: "2026-08-01T00:00:00.000Z",
            du: "2026-08-15T00:00:00.000Z",
            st: InvoiceStatus.PAID,
            no: "Receipt R-441",
            items: [{ d: "Subscription annual", q: 1, p: 4999 }],
        },
        {
            n: "INV-9103",
            o: admin.email,
            cn: "Stark Industries",
            ce: "ap@stark.com",
            is: "2026-06-10T00:00:00.000Z",
            du: "2026-06-20T00:00:00.000Z",
            st: InvoiceStatus.CANCELLED,
            no: "Cancelled",
            items: [{ d: "Prototype R&D", q: 6, p: 350 }],
        },
    ];
    for (const inv of invoices) {
        const total = inv.items.reduce((s, i) => s + i.q * i.p, 0);
        await prisma.invoice.upsert({
            where: { invoiceNumber: inv.n },
            update: {
                status: inv.st,
                notes: inv.no,
                amount: total,
            },
            create: {
                invoiceNumber: inv.n,
                createdById: ids[inv.o],
                clientName: inv.cn,
                clientEmail: inv.ce,
                issueDate: new Date(inv.is),
                dueDate: new Date(inv.du),
                status: inv.st,
                notes: inv.no,
                amount: total,
                items: {
                    create: inv.items.map((it) => ({
                        description: it.d,
                        quantity: it.q,
                        unitPrice: it.p,
                        amount: it.q * it.p,
                    })),
                },
            },
        });
    }
    console.log("Seed done");
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1); // ✅ now recognized because @types/node + types:["node"]
})
    .finally(async () => {
    await prisma.$disconnect();
});
