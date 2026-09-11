import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Receipt, ShieldCheck, TrendingUp, Zap } from "lucide-react";

const highlights = [
  {
    icon: TrendingUp,
    title: "Live revenue insights",
    desc: "Track paid, pending and overdue in real time.",
  },
  {
    icon: ShieldCheck,
    title: "Role-based access",
    desc: "Admins manage everything, users own their invoices.",
  },
  {
    icon: Zap,
    title: "Bulk operations",
    desc: "Update or archive dozens of invoices in one action.",
  },
];

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="relative flex items-center gap-2 text-lg font-semibold">
          <div className="rounded-lg bg-white/10 p-2">
            <Receipt className="h-5 w-5" />
          </div>
          Invoicely
        </div>

        <div className="relative space-y-8">
          <h1 className="max-w-md text-4xl font-semibold leading-tight tracking-tight">
            Invoicing that keeps your cash flow honest.
          </h1>
          <div className="space-y-5">
            {highlights.map((h, i) => (
              <motion.div
                key={h.title}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.4 }}
                className="flex gap-4"
              >
                <div className="h-fit rounded-lg bg-white/10 p-2">
                  <h.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">{h.title}</p>
                  <p className="text-sm text-white/60">{h.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-white/40">
          © {new Date().getFullYear()} Invoicely
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-background p-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-sm space-y-6"
        >
          <div className="space-y-1.5">
            <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {children}
        </motion.div>
      </div>
    </div>
  );
}
