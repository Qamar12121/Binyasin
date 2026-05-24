import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Sun, Moon, Phone } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, token } = useAuth();
  const isAuthenticated = !!token && !!user;
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About Us" },
    { href: "/our-story", label: "Our Story" },
    { href: "/services", label: "Services" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm font-serif">BYT</span>
            </div>
            <div>
              <div className="font-serif font-bold text-white text-sm leading-none">Bin Yasin</div>
              <div className="text-primary text-xs font-medium tracking-wider">TRAVELS</div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href}
                className={`text-sm font-medium transition-colors ${location === l.href ? "text-primary" : "text-white/70 hover:text-white"}`}>
                {l.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <a href="tel:+923018780888" className="flex items-center gap-1.5 text-primary text-sm font-medium">
              <Phone className="w-3.5 h-3.5" />
              +923018780888
            </a>
            <button onClick={toggleTheme} className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {isAuthenticated ? (
              <Link href={user?.role === "admin" ? "/admin" : "/dashboard"}>
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">Dashboard</Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">Sign In</Button>
              </Link>
            )}
          </div>

          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-white/80 hover:text-white">
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden border-t border-white/10 py-4 space-y-2">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setIsOpen(false)}
                className="block px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                {l.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-white/10">
              {isAuthenticated ? (
                <Link href={user?.role === "admin" ? "/admin" : "/dashboard"} onClick={() => setIsOpen(false)}>
                  <Button size="sm" className="w-full bg-primary text-primary-foreground">Dashboard</Button>
                </Link>
              ) : (
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <Button size="sm" className="w-full bg-primary text-primary-foreground">Sign In</Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
