import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function DeleteInvoiceDialog({
  open,
  onOpenChange,
  invoiceNumber,
  hard = false,
  pending = false,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceNumber: string;
  hard?: boolean;
  pending?: boolean;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-destructive/10 p-3">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <DialogTitle>
              {hard ? "Permanently delete" : "Archive"} invoice {invoiceNumber}?
            </DialogTitle>
          </div>
          <DialogDescription>
            {hard
              ? "This will permanently remove the invoice and all of its line items. This action cannot be undone."
              : "The invoice will be archived and hidden from the invoice list. Only admins can restore it."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" disabled={pending} onClick={onConfirm}>
            {hard ? "Delete permanently" : "Archive invoice"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}