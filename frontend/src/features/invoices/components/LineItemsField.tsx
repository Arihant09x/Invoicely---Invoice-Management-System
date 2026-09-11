import { useFieldArray, useWatch, type UseFormReturn } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { money } from "@/lib/format";
import type { InvoiceStatus } from "@/types/invoice";

export interface InvoiceItemFormValues {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceFormValues {
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  notes: string;
  items: InvoiceItemFormValues[];
}

const emptyItem = (): InvoiceItemFormValues => ({
  description: "",
  quantity: 1,
  unitPrice: 0,
});

export function LineItemsField({
  form,
}: {
  form: UseFormReturn<InvoiceFormValues>;
}) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const items = useWatch({
    control: form.control,
    name: "items",
  }) as InvoiceItemFormValues[] | undefined;

  const total = (items ?? []).reduce(
    (sum, item) =>
      sum + (Number(item?.quantity) || 0) * (Number(item?.unitPrice) || 0),
    0,
  );

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base">Line items</CardTitle>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => append(emptyItem())}
        >
          <Plus className="mr-1 h-4 w-4" />
          Add item
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {fields.map((field, index) => {
          const qty = Number(items?.[index]?.quantity) || 0;
          const price = Number(items?.[index]?.unitPrice) || 0;
          const fieldErrors = form.formState.errors.items?.[index];

          return (
            <div
              key={field.id}
              className="grid grid-cols-12 items-start gap-2 rounded-lg border p-3"
            >
              <div className="col-span-12 space-y-1 sm:col-span-5">
                <Label className="text-xs">Description</Label>
                <Input
                  placeholder="Design work"
                  {...form.register(`items.${index}.description`)}
                />
                {fieldErrors?.description && (
                  <p className="text-xs text-destructive">
                    {fieldErrors.description.message}
                  </p>
                )}
              </div>

              <div className="col-span-4 space-y-1 sm:col-span-2">
                <Label className="text-xs">Qty</Label>
                <Input
                  type="number"
                  min={1}
                  step={1}
                  {...form.register(`items.${index}.quantity`)}
                />
              </div>

              <div className="col-span-5 space-y-1 sm:col-span-2">
                <Label className="text-xs">Unit price</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  {...form.register(`items.${index}.unitPrice`)}
                />
              </div>

              <div className="col-span-2 space-y-1 sm:col-span-2">
                <Label className="text-xs">Amount</Label>
                <div className="flex h-10 items-center justify-end rounded-md bg-muted px-3 text-sm tabular-nums">
                  {money(qty * price)}
                </div>
              </div>

              <div className="col-span-1 flex justify-end pt-6">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 text-destructive"
                  disabled={fields.length === 1}
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}

        {form.formState.errors.items?.root && (
          <p className="text-xs text-destructive">
            {form.formState.errors.items.root.message}
          </p>
        )}

        <Separator />
        <div className="flex items-center justify-end gap-6">
          <span className="text-sm text-muted-foreground">Invoice total</span>
          <span className="text-2xl font-semibold tabular-nums">
            {money(total)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
