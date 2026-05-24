import { motion } from "framer-motion";
import { Plane, Package, BookOpen, CreditCard, TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useListBookings, useGetLedger } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  approved: "bg-green-500/10 text-green-400 border-green-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  cancelled: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

export default function DashboardHome() {
  const { user } = useAuth();
  const { data: bookings } = useListBookings();
  const { data: ledger } = useGetLedger();

  const stats = [
    { label: "Total Bookings", value: bookings?.length || 0, icon: BookOpen, color: "bg-blue-500/10 text-blue-400", href: "/dashboard/airline-bookings" },
    { label: "Pending Bookings", value: bookings?.filter(b => b.status === "pending").length || 0, icon: Clock, color: "bg-yellow-500/10 text-yellow-400", href: "/dashboard/airline-bookings" },
    { label: "Approved", value: bookings?.filter(b => b.status === "approved").length || 0, icon: CheckCircle, color: "bg-green-500/10 text-green-400", href: "/dashboard/airline-bookings" },
    { label: "Account Balance", value: `PKR ${((ledger?.balance || 0) / 1000).toFixed(0)}K`, icon: CreditCard, color: "bg-primary/10 text-primary", href: "/dashboard/ledger" },
  ];

  const quickLinks = [
    { href: "/dashboard/group-tickets", icon: Plane, label: "Group Tickets", desc: "KSA, UAE, Qatar flights" },
    { href: "/dashboard/umrah-tickets", icon: Plane, label: "Umrah Tickets", desc: "Dedicated Umrah flights" },
    { href: "/dashboard/umrah-packages", icon: Package, label: "Umrah Packages", desc: "Economy to Luxury" },
    { href: "/dashboard/ledger", icon: CreditCard, label: "Account Ledger", desc: "View transactions" },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-serif font-bold text-foreground">Welcome, {user?.agencyName}</h1>
        <p className="text-muted-foreground text-sm mt-1">Here's an overview of your account activity.</p>
      </motion.div>

      {user?.status === "pending" && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-start gap-3">
          <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-400 font-medium text-sm">Account Pending Approval</p>
            <p className="text-yellow-400/70 text-xs mt-0.5">Your account is awaiting admin approval. You'll receive full access once approved.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link href={s.href}>
              <div className="bg-card border border-border rounded-xl p-4 hover:border-primary/40 transition-all cursor-pointer group" data-testid={`stat-card-${i}`}>
                <div className={`w-9 h-9 rounded-lg ${s.color} flex items-center justify-center mb-3`}>
                  <s.icon className="w-4 h-4" />
                </div>
                <div className="font-serif text-2xl font-bold text-foreground">{s.value}</div>
                <div className="text-muted-foreground text-xs mt-0.5">{s.label}</div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold text-foreground text-sm">Recent Bookings</h2>
              <Link href="/dashboard/airline-bookings" className="text-primary text-xs hover:underline">View all</Link>
            </div>
            {!bookings || bookings.length === 0 ? (
              <div className="p-8 text-center">
                <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">No bookings yet. Start by browsing available tickets.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {bookings.slice(0, 5).map((b) => (
                  <div key={b.id} className="px-5 py-3 flex items-center justify-between" data-testid={`booking-row-${b.id}`}>
                    <div>
                      <p className="text-sm font-medium text-foreground">{b.bookingReference}</p>
                      <p className="text-xs text-muted-foreground capitalize">{b.type} booking • {b.passengers.length} pax</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[b.status]}`}>{b.status}</span>
                      <p className="text-xs text-muted-foreground mt-0.5">PKR {b.totalAmount.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-semibold text-foreground text-sm px-1">Quick Access</h2>
          {quickLinks.map((l, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Link href={l.href}>
                <div className="bg-card border border-border rounded-xl p-4 hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <l.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{l.label}</p>
                    <p className="text-xs text-muted-foreground">{l.desc}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
