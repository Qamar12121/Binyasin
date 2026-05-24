import { motion } from "framer-motion";
import { Users, BookOpen, Plane, Package, DollarSign, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { useGetAdminDashboard } from "@workspace/api-client-react";

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useGetAdminDashboard();

  const cards = [
    { label: "Total Agents", value: stats?.totalAgents ?? 0, sub: `${stats?.pendingAgents ?? 0} pending`, icon: Users, color: "bg-blue-500/10 text-blue-400", href: "/admin/agents" },
    { label: "Total Bookings", value: stats?.totalBookings ?? 0, sub: `${stats?.pendingBookings ?? 0} pending`, icon: BookOpen, color: "bg-yellow-500/10 text-yellow-400", href: "/admin/bookings" },
    { label: "Group Tickets", value: stats?.bookingsByType?.find(b => b.type === "group")?.count ?? 0, sub: "Group bookings", icon: Plane, color: "bg-purple-500/10 text-purple-400", href: "/admin/group-tickets" },
    { label: "Umrah Packages", value: stats?.bookingsByType?.find(b => b.type === "package")?.count ?? 0, sub: "Package bookings", icon: Package, color: "bg-green-500/10 text-green-400", href: "/admin/packages" },
    { label: "Revenue (PKR)", value: stats?.totalRevenue ? `${(stats.totalRevenue / 1000000).toFixed(1)}M` : "0", sub: "Total processed", icon: DollarSign, color: "bg-primary/10 text-primary", href: "/admin/transactions" },
    { label: "Pending Agents", value: stats?.pendingAgents ?? 0, sub: "Awaiting approval", icon: CheckCircle, color: "bg-emerald-500/10 text-emerald-400", href: "/admin/agents" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of all platform activity</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link href={c.href}>
              <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/40 transition-all cursor-pointer group" data-testid={`admin-stat-${i}`}>
                <div className={`w-10 h-10 rounded-lg ${c.color} flex items-center justify-center mb-3`}>
                  <c.icon className="w-5 h-5" />
                </div>
                <div className="font-serif text-2xl font-bold text-foreground">{isLoading ? "..." : c.value}</div>
                <div className="text-foreground text-sm font-medium mt-0.5">{c.label}</div>
                <div className="text-muted-foreground text-xs mt-0.5">{c.sub}</div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-foreground text-sm">Pending Agent Approvals</h2>
            <Link href="/admin/agents" className="text-primary text-xs hover:underline">View all</Link>
          </div>
          <div className="p-5 text-center text-muted-foreground text-sm">
            <Users className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            {stats?.pendingAgents ? `${stats.pendingAgents} agents awaiting approval` : "No pending approvals"}
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-foreground text-sm">Recent Bookings</h2>
            <Link href="/admin/bookings" className="text-primary text-xs hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-border">
            {stats?.recentBookings?.slice(0, 3).map(b => (
              <div key={b.id} className="px-5 py-3 flex justify-between items-center">
                <div>
                  <p className="text-xs font-mono text-primary">{b.bookingReference}</p>
                  <p className="text-xs text-muted-foreground capitalize">{b.type} • {b.passengers.length} pax</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${b.status === "approved" ? "bg-green-500/10 text-green-400 border-green-500/20" : b.status === "rejected" ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"}`}>{b.status}</span>
              </div>
            )) || (
              <div className="p-5 text-center text-muted-foreground text-sm">
                <BookOpen className="w-8 h-8 mx-auto mb-2" />
                No recent bookings
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
