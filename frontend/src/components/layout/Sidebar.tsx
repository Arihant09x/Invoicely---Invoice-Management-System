import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Receipt,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/hooks/useAuth";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/invoices", label: "Invoices", icon: FileText },
  { to: "/invoices/new", label: "New invoice", icon: PlusCircle },
];

export function SidebarContent() {
  const { user, isAdmin } = useAuth();

  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <div className="flex items-center gap-2 px-2 py-1 text-lg font-semibold">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <Receipt className="h-5 w-5" />
        </div>
        Invoicely
      </div>

      <nav className="space-y-1">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-lg bg-primary/10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <item.icon className="relative h-4 w-4" />
                <span className="relative">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-xl border bg-muted/40 p-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          {isAdmin && <ShieldCheck className="h-4 w-4 text-emerald-600" />}
          {user?.name ?? user?.email}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {isAdmin ? "Administrator" : "Standard user"}
        </p>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r bg-card lg:block sticky top-0 z-20 h-screen">
      <SidebarContent />
    </aside>
  );
}
