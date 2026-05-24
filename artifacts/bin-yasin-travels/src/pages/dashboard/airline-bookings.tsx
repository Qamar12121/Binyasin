import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Printer, Search } from "lucide-react";
import { useListBookings, getListBookingsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  approved: "bg-green-500/10 text-green-400 border-green-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  cancelled: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

export default function AirlineBookingsPage() {
  const [search, setSearch] = useState("");
  const { data: allBookings, isLoading } = useListBookings({ type: undefined });
  const bookings = allBookings?.filter(b => b.type !== "package") || [];
  const filtered = bookings.filter(b => b.bookingReference.toLowerCase().includes(search.toLowerCase()) || (b.passengers?.[0] as any)?.surname?.toLowerCase().includes(search.toLowerCase()));

  const printTicket = (booking: any) => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<html><head><title>Ticket - ${booking.bookingReference}</title><style>body{font-family:sans-serif;padding:20px}h2{color:#1a1a2e}.row{display:flex;justify-content:space-between;margin:8px 0;border-bottom:1px solid #eee;padding:4px 0}</style></head><body>
      <h2>Bin Yasin Travels - Flight Ticket</h2>
      <div class="row"><span>Booking Ref</span><strong>${booking.bookingReference}</strong></div>
      <div class="row"><span>Airline</span><strong>${booking.ticketDetails?.airline || "N/A"}</strong></div>
      <div class="row"><span>Route</span><strong>${booking.ticketDetails?.origin || ""} → ${booking.ticketDetails?.destination || "Makkah"}</strong></div>
      <div class="row"><span>Date</span><strong>${booking.ticketDetails?.travelDate || "N/A"}</strong></div>
      <div class="row"><span>Status</span><strong>${booking.status}</strong></div>
      <div class="row"><span>Total</span><strong>PKR ${booking.totalAmount?.toLocaleString()}</strong></div>
      <h3>Passengers</h3>
      ${booking.passengers?.map((p: any, i: number) => `<div class="row"><span>Pax ${i+1}</span><strong>${p.title} ${p.givenName} ${p.surname} | ${p.passportNumber}</strong></div>`).join("")}
      <p style="margin-top:20px;font-size:12px;color:#666">Bin Yasin Travels | +923018780888 | info@binyasintravels.com</p>
    </body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Airline Bookings</h1>
          <p className="text-muted-foreground text-sm mt-1">All group and Umrah flight bookings</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search bookings..." className="pl-9 h-9 w-56" data-testid="input-search-bookings" />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No airline bookings found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {["Ref", "Type", "Route", "Date", "Passengers", "Amount", "Status", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((b) => (
                  <motion.tr key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="hover:bg-muted/30 transition-colors" data-testid={`booking-row-${b.id}`}>
                    <td className="px-4 py-3 font-mono text-xs text-primary">{b.bookingReference}</td>
                    <td className="px-4 py-3 capitalize text-foreground text-xs">{b.type}</td>
                    <td className="px-4 py-3 text-foreground text-xs">{(b as any).ticketDetails?.origin || "—"}{(b as any).ticketDetails?.destination ? ` → ${(b as any).ticketDetails.destination}` : ""}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{(b as any).ticketDetails?.travelDate || new Date(b.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-foreground text-xs">{b.passengers?.length || 0} pax</td>
                    <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">PKR {b.totalAmount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[b.status]}`}>{b.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="outline" onClick={() => printTicket(b)} className="h-7 text-xs" data-testid={`button-print-${b.id}`}>
                        <Printer className="w-3 h-3 mr-1" />Print
                      </Button>
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
