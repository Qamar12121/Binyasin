import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
  LayoutDashboard, Plane, Package, Users, BookOpen, DollarSign,
  Menu, X, Sun, Moon, LogOut, ChevronRight, ShieldCheck
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/group-tickets", icon: Plane, label: "Group Tickets" },
  { href: "/admin/umrah-tickets", icon: Plane, label: "Umrah Tickets" },
  { href: "/admin/packages", icon: Package, label: "Umrah Packages" },
  { href: "/admin/agents", icon: Users, label: "Agents" },
  { href: "/admin/bookings", icon: BookOpen, label: "All Bookings" },
  { href: "/admin/transactions", icon: DollarSign, label: "Transactions" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [location, setLocation] = useLocation();

  const handleLogout = () => { logout(); setLocation("/"); };

  return (
    <div className="min-h-screen flex bg-background">
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed top-0 left-0 h-full w-64 bg-sidebar text-sidebar-foreground z-30 transform transition-transform duration-300 flex flex-col
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <span className="text-white font-semibold text-sm">Admin Panel</span>
          </div>
          <p className="text-white/40 text-xs">Bin Yasin Travels</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = location === href;
            return (
              <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"}`}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
                {active && <ChevronRight className="w-3 h-3 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col md:ml-64">
        <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-1.5 rounded-lg hover:bg-muted transition-colors">
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <Avatar className="w-7 h-7">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {user?.fullName?.charAt(0) || "A"}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium text-foreground hidden sm:block">{user?.fullName}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
