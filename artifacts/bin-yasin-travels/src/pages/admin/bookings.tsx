import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, CheckCircle, XCircle, Search, Printer } from "lucide-react";
import { useListAllBookings, useAdminUpdateBookingStatus, getListAllBookingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  approved: "bg-green-500/10 text-green-400 border-green-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  cancelled: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

export default function AdminBookingsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: allBookings, isLoading } = useListAllBookings();
  const updateStatus = useAdminUpdateBookingStatus();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const bookings = (allBookings || []).filter(b => statusFilter === "all" || b.status === statusFilter);

  const filtered = bookings.filter(b =>
    b.bookingReference.toLowerCase().includes(search.toLowerCase()) ||
    (b as any).agentName?.toLowerCase().includes(search.toLowerCase())
  );

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListAllBookingsQueryKey() });

  const handleApprove = (id: number) => {
    updateStatus.mutate({ id, data: { status: "approved" } }, {
      onSuccess: () => { invalidate(); toast({ title: "Booking approved" }); },
      onError: () => toast({ title: "Action failed", variant: "destructive" }),
    });
  };

  const handleReject = (id: number) => {
    if (!confirm("Reject this booking?")) return;
    updateStatus.mutate({ id, data: { status: "rejected" } }, {
      onSuccess: () => { invalidate(); toast({ title: "Booking rejected" }); },
      onError: () => toast({ title: "Action failed", variant: "destructive" }),
    });
  };

  const printTicket = (b: any) => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<html><head><title>Ticket ${b.bookingReference}</title></head><body style="font-family:sans-serif;padding:20px">
      <h2>Bin Yasin Travels - Booking</h2>
      <p>Ref: <strong>${b.bookingReference}</strong> | Status: <strong>${b.status}</strong></p>
      <p>Agent: ${b.agentName || "N/A"} | Type: ${b.type} | Amount: PKR ${b.totalAmount?.toLocaleString()}</p>
      ${b.passengers?.map((p: any) => `<p>Pax: ${p.title} ${p.givenName} ${p.surname} | ${p.passportNumber}</p>`).join("")}
      <p style="font-size:11px;color:#666">Bin Yasin Travels | +923018780888</p>
    </body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-serif font-bold text-foreground">All Bookings</h1><p className="text-muted-foreground text-sm mt-1">Manage and approve all bookings</p></div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by ref or agent..." className="pl-9 h-9" data-testid="input-search-all-bookings" />
        </div>
        <Select defaultValue="all" onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? <div className="p-6 space-y-2">{[1,2,3].map(i => <div key={i} className="h-14 bg-muted rounded animate-pulse" />)}</div>
        : filtered.length === 0 ? <div className="p-12 text-center"><BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-2" /><p className="text-muted-foreground text-sm">No bookings found.</p></div>
        : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/50">
                {["Ref", "Agent", "Type", "Route/Pkg", "Pax", "Amount", "Status", "Date", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-border">
                {filtered.map(b => (
                  <motion.tr key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="hover:bg-muted/30" data-testid={`admin-booking-row-${b.id}`}>
                    <td className="px-4 py-3 font-mono text-xs text-primary">{b.bookingReference}</td>
                    <td className="px-4 py-3 text-foreground text-xs">{(b as any).agentName || "—"}</td>
                    <td className="px-4 py-3 capitalize text-foreground text-xs">{b.type}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{(b as any).ticketDetails?.airline || (b as any).ticketDetails?.packageName || "—"}</td>
                    <td className="px-4 py-3 text-foreground text-xs">{b.passengers?.length || 0}</td>
                    <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap text-xs">PKR {b.totalAmount.toLocaleString()}</td>
                    <td className="px-4 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[b.status]}`}>{b.status}</span></td>
                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{new Date(b.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {b.status === "pending" && (
                          <>
                            <Button size="sm" onClick={() => handleApprove(b.id)}
                              className="h-7 bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 text-xs px-2" data-testid={`button-approve-booking-${b.id}`}>
                              <CheckCircle className="w-3 h-3" />
                            </Button>
                            <Button size="sm" onClick={() => handleReject(b.id)}
                              className="h-7 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 text-xs px-2" data-testid={`button-reject-booking-${b.id}`}>
                              <XCircle className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="outline" onClick={() => printTicket(b)} className="h-7 w-7 p-0"><Printer className="w-3 h-3" /></Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
