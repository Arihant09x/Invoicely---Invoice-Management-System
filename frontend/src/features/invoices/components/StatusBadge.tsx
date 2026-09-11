import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { InvoiceStatus } from "@/types/invoice";

const styles: Record<InvoiceStatus, string> = {
  DRAFT:
    "bg-slate-100 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300",
  PENDING: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  PAID: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
  OVERDUE: "bg-rose-100 text-rose-800 hover:bg-rose-100",
  CANCELLED: "bg-gray-100 text-gray-600 line-through hover:bg-gray-100",
};

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <Badge variant="secondary" className={cn("font-medium", styles[status])}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </Badge>
  );
}
