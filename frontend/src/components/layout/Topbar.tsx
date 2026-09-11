import { useNavigate } from "react-router-dom";
import { LogOut, Search } from "lucide-react";
import { MobileNav } from "./MobileNav";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function Topbar({ onOpenPalette }: { onOpenPalette: () => void }) {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const initials = (user?.name ?? user?.email ?? "U")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur">
      <MobileNav />

      <button
        onClick={onOpenPalette}
        className="flex w-90 cursor-pointer items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted"
      >
        <Search className="h-4 w-4" />
        Search invoices...
        <kbd className="ml-auto hidden rounded border bg-background px-1.5 py-0.5 text-[10px] sm:inline">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-3">
        {isAdmin && (
          <Badge variant="secondary" className="hidden sm:inline-flex">
            Admin
          </Badge>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="flex cursor-pointer items-center gap-2 rounded-full outline-none hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
              />
            }
            nativeButton={false}
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span className="sr-only">Open user menu</span>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{user?.name ?? "Account"}</p>
              <p className="text-xs font-normal text-muted-foreground">
                {user?.email}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive hover:cursor-pointer"
              onClick={() => {
                signOut();
                navigate("/login", { replace: true });
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
