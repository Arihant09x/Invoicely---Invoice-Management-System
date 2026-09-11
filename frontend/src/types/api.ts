export interface DashboardOverview {
  range: { from: string; to: string; groupBy: "day" | "week" | "month" };
  kpis: {
    totalInvoices: number;
    paidInvoices: number;
    pendingInvoices: number;
    overdueInvoices: number;
    draftInvoices: number;
    cancelledInvoices: number;
    totalRevenue: number;
    outstandingAmount: number;
    overdueAmount: number;
    avgInvoiceValue: number;
  };
  breakdowns: {
    statusCounts: Record<string, number>;
    statusAmounts: Record<string, number>;
    overdueAging: { bucket: string; count: number; amount: number }[];
  };
  charts: {
    timeSeries: {
      bucket: string;
      invoicesCount: number;
      revenuePaid: number;
      outstanding: number;
    }[];
  };
  tables: {
    recentInvoices: {
      id: string;
      invoiceNumber: string;
      clientName: string;
      status: string;
      amount: number;
      issueDate: string;
      dueDate: string;
      createdAt: string;
    }[];
    overdueInvoices: {
      id: string;
      invoiceNumber: string;
      clientName: string;
      amount: number;
      dueDate: string;
    }[];
    topClients: { clientName: string; outstanding: number; invoices: number }[];
  };
}

export interface ApiErrorBody {
  message: string;
  errors?: { fieldErrors?: Record<string, string[]>; formErrors?: string[] };
  details?: unknown;
}
