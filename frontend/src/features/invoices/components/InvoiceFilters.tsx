import { useEffect, useState } from "react";
import { CalendarIcon, Search, X } from "lucide-react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { INVOICE_STATUSES, type InvoiceStatus } from "@/types/invoice";

export interface FiltersValue {
  q: string;
  status?: InvoiceStatus;
  range?: DateRange;
}

export function InvoiceFilters({
  value,
  onChange,
}: {
  value: FiltersValue;
  onChange: (v: FiltersValue) => void;
}) {
  const [localQ, setLocalQ] = useState(value.q);
  // Track the last `q` we received from the parent. When it changes (e.g.
  // the user clicks "Clear"), we reset the local input during render rather
  // than inside an effect — avoids cascading renders.
  const [lastPropQ, setLastPropQ] = useState(value.q);

  if (value.q !== lastPropQ) {
    setLastPropQ(value.q);
    setLocalQ(value.q);
  }

  // Debounce the search input → notify parent after 400ms of inactivity.
  useEffect(() => {
    const t = setTimeout(() => {
      if (localQ !== value.q) onChange({ ...value, q: localQ });
    }, 400);
    return () => clearTimeout(t);
  }, [localQ]);

  const hasFilters = value.q || value.status || value.range?.from;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-[220px] flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search invoice # or client..."
          value={localQ}
          onChange={(e) => setLocalQ(e.target.value)}
        />
      </div>

      <Select
        value={value.status ?? "ALL"}
        onValueChange={(v) =>
          onChange({
            ...value,
            status: v === "ALL" ? undefined : (v as InvoiceStatus),
          })
        }
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All statuses</SelectItem>
          {INVOICE_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger
          render={
            <Button variant="outline" className="justify-start font-normal" />
          }
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value.range?.from
            ? value.range.to
              ? `${format(value.range.from, "dd MMM")} – ${format(value.range.to, "dd MMM")}`
              : format(value.range.from, "dd MMM yyyy")
            : "Date range"}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            numberOfMonths={2}
            selected={value.range}
            onSelect={(range) => onChange({ ...value, range })}
          />
        </PopoverContent>
      </Popover>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setLocalQ("");
            onChange({ q: "", status: undefined, range: undefined });
          }}
        >
          <X className="mr-1 h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
