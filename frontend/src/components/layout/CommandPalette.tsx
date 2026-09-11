import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  FileCheck2,
  FileClock,
  FileText,
  FileWarning,
  LayoutDashboard,
  PlusCircle,
} from "lucide-react";

const STATIC = [
  { label: "Dashboard", hint: "Overview", path: "/", Icon: LayoutDashboard },
  { label: "All invoices", hint: "List", path: "/invoices", Icon: FileText },
  {
    label: "Create invoice",
    hint: "New",
    path: "/invoices/new",
    Icon: PlusCircle,
  },
  {
    label: "Overdue invoices",
    hint: "Filter",
    path: "/invoices?status=OVERDUE",
    Icon: FileWarning,
  },
  {
    label: "Pending invoices",
    hint: "Filter",
    path: "/invoices?status=PENDING",
    Icon: FileClock,
  },
  {
    label: "Paid invoices",
    hint: "Filter",
    path: "/invoices?status=PAID",
    Icon: FileCheck2,
  },
];

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const go = (path: string) => {
    onOpenChange(false);
    setQ("");
    navigate(path);
  };

  const filtered = STATIC.filter((s) =>
    `${s.label} ${s.hint}`.toLowerCase().includes(q.trim().toLowerCase()),
  );

  return (
    <Dialog open={open} onOpenChange={(openNext) => onOpenChange(openNext)}>
      <DialogContent className="top-1/3 max-w-md translate-y-0 overflow-hidden p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Command palette</DialogTitle>
          <DialogDescription>Jump to…</DialogDescription>
        </DialogHeader>
        <div className="border-b p-2">
          <Input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Jump to… (dashboard, invoices, overdue…)"
            className="border-0 shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="max-h-72 overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </p>
          ) : (
            filtered.map((s) => (
              <button
                key={s.path + s.label}
                type="button"
                onClick={() => go(s.path)}
                className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-left text-sm outline-none transition hover:bg-muted focus-visible:bg-muted"
              >
                <s.Icon className="h-4 w-4 text-muted-foreground" />
                <span>{s.label}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {s.hint}
                </span>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
