import { Link, useLocation } from "react-router-dom";
import { House, Handshake, Shield, ChartBar, User, SignOut, Sidebar as SidebarIcon } from "@phosphor-icons/react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const navItems = {
  trader: [
    { to: "/trader", icon: House, label: "Dashboard" },
    { to: "/trader/transactions", icon: Handshake, label: "Transactions" },
    { to: "/trader/vouches", icon: Shield, label: "Vouches" },
    { to: "/trader/profile", icon: User, label: "Profile" },
  ],
  lender: [
    { to: "/lender", icon: House, label: "Dashboard" },
    { to: "/lender/traders", icon: User, label: "Traders" },
    { to: "/lender/transactions", icon: Handshake, label: "Transactions" },
    { to: "/lender/profile", icon: User, label: "Profile" },
  ],
  admin: [
    { to: "/admin", icon: House, label: "Dashboard" },
    { to: "/admin/traders", icon: User, label: "Traders" },
    { to: "/admin/lenders", icon: Handshake, label: "Lenders" },
    { to: "/admin/fraud", icon: Shield, label: "Fraud Flags" },
    { to: "/admin/analytics", icon: ChartBar, label: "Analytics" },
  ],
};

export function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const items = navItems[user.role];

  const NavContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Shield className="h-5 w-5" weight="fill" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight">TrustLedger</h1>
          <p className="text-xs text-muted-foreground capitalize">{user.role} Portal</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5" weight={isActive ? "fill" : "regular"} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t px-3 py-4">
        <div className="mb-3 px-3">
          <p className="text-sm font-medium">{user.username}</p>
          <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
        </div>
        <Button variant="ghost" className="w-full justify-start gap-3" onClick={logout}>
          <SignOut className="h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:bg-card">
        <NavContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden fixed top-4 left-4 z-50">
            <SidebarIcon className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <NavContent />
        </SheetContent>
      </Sheet>
    </>
  );
}
