import { AnimatePresence, motion } from "framer-motion";
import { Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { INVOICE_STATUSES, type InvoiceStatus } from "@/types/invoice";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function BulkActionBar({
  count,
  onClear,
  onStatusChange,
  onDelete,
  pending,
}: {
  count: number;
  onClear: () => void;
  onStatusChange: (s: InvoiceStatus) => void;
  onDelete: (hard: boolean) => void;
  pending: boolean;
}) {
  const { isAdmin } = useAuth();

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-full border bg-background/95 px-4 py-2.5 shadow-lg backdrop-blur"
        >
          <span className="text-sm font-medium">{count} selected</span>

          <Select
            onValueChange={(v) => onStatusChange(v as InvoiceStatus)}
            disabled={pending}
          >
            <SelectTrigger className="h-8 w-[150px]">
              <SelectValue placeholder="Change status" />
            </SelectTrigger>
            <SelectContent>
              {INVOICE_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => onDelete(false)}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Archive
          </Button>

          {isAdmin && (
            <Button
              size="sm"
              variant="destructive"
              disabled={pending}
              onClick={() => onDelete(true)}
            >
              Delete permanently
            </Button>
          )}

          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={onClear}
          >
            <X className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
