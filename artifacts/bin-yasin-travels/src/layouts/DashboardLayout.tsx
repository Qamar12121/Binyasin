import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
  Plane, Package, Home, BookOpen, CreditCard, User, Lock, LogOut,
  Menu, X, Sun, Moon, ChevronRight, Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/dashboard/group-tickets", icon: Plane, label: "Group Tickets" },
  { href: "/dashboard/umrah-tickets", icon: Plane, label: "Umrah Tickets" },
  { href: "/dashboard/umrah-packages", icon: Package, label: "Umrah Packages" },
  { href: "/dashboard/ledger", icon: CreditCard, label: "Account (Ledger)" },
  { href: "/dashboard/airline-bookings", icon: BookOpen, label: "Airline Bookings" },
  { href: "/dashboard/package-bookings", icon: BookOpen, label: "Package Bookings" },
  { href: "/dashboard/profile", icon: User, label: "My Profile" },
  { href: "/dashboard/change-password", icon: Lock, label: "Change Password" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
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
        <div className="p-4 border-b border-sidebar-border flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <span className="text-sidebar-primary-foreground font-bold text-sm font-serif">BYT</span>
          </div>
          <div>
            <div className="font-serif font-bold text-white text-sm leading-none">Bin Yasin</div>
            <div className="text-sidebar-primary text-xs font-medium tracking-wider">TRAVELS</div>
          </div>
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
            <h2 className="text-sm font-semibold text-foreground hidden sm:block">{navItems.find(n => n.href === location)?.label || "Dashboard"}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
            </button>
            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <Avatar className="w-7 h-7">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {user?.agencyName?.charAt(0) || "A"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-xs font-medium text-foreground leading-none">{user?.agencyName}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{user?.city}</p>
              </div>
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
