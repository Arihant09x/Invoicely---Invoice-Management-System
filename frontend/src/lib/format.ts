import { format, formatDistanceToNowStrict, isPast, parseISO } from "date-fns";

export const money = (v: string | number, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(v));

export const compactMoney = (v: number, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(v);

export const shortDate = (iso: string) => format(parseISO(iso), "dd MMM yyyy");
export const longDate = (iso: string) =>
  format(parseISO(iso), "dd MMM yyyy, HH:mm");

export const dueLabel = (iso: string) => {
  const d = parseISO(iso);
  return isPast(d)
    ? `Overdue by ${formatDistanceToNowStrict(d)}`
    : `Due in ${formatDistanceToNowStrict(d)}`;
};
