import { useState } from "react";
import { motion } from "framer-motion";
import { Package, Printer, Search, Hotel } from "lucide-react";
import { useListBookings } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  approved: "bg-green-500/10 text-green-400 border-green-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  cancelled: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

export default function PackageBookingsPage() {
  const [search, setSearch] = useState("");
  const { data: allBookings, isLoading } = useListBookings({ type: "package" });
  const bookings = allBookings || [];
  const filtered = bookings.filter(b => b.bookingReference.toLowerCase().includes(search.toLowerCase()));

  const printVoucher = (b: any) => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<html><head><title>Hotel Voucher - ${b.bookingReference}</title><style>body{font-family:sans-serif;padding:20px}.row{display:flex;justify-content:space-between;margin:8px 0;border-bottom:1px solid #eee;padding:4px 0}</style></head><body>
      <h2>Bin Yasin Travels - Hotel Voucher</h2>
      <div class="row"><span>Booking Ref</span><strong>${b.bookingReference}</strong></div>
      <div class="row"><span>Package</span><strong>${b.ticketDetails?.packageName || "Umrah Package"}</strong></div>
      <div class="row"><span>Hotel</span><strong>${b.ticketDetails?.hotel || "N/A"}</strong></div>
      <div class="row"><span>Duration</span><strong>${b.ticketDetails?.duration || "N/A"} days</strong></div>
      <div class="row"><span>Visa</span><strong>${b.ticketDetails?.visaIncluded ? "Included" : "Not Included"}</strong></div>
      <div class="row"><span>Total</span><strong>PKR ${b.totalAmount?.toLocaleString()}</strong></div>
      <h3>Guests</h3>
      ${b.passengers?.map((p: any, i: number) => `<div class="row"><span>Guest ${i+1}</span><strong>${p.title} ${p.givenName} ${p.surname} | ${p.passportNumber}</strong></div>`).join("")}
      <p style="margin-top:20px;font-size:12px;color:#666">Bin Yasin Travels | +923018780888 | info@binyasintravels.com</p>
    </body></html>`);
    win.document.close();
    win.print();
  };

  const printTicket = (b: any) => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<html><head><title>Package Ticket - ${b.bookingReference}</title></head><body>
      <h2>Bin Yasin Travels - Package Booking</h2>
      <p>Booking Ref: <strong>${b.bookingReference}</strong></p>
      <p>Package: <strong>${b.ticketDetails?.packageName || "Umrah Package"}</strong></p>
      <p>Tier: <strong>${b.ticketDetails?.tier || "N/A"}</strong></p>
      <p>Status: <strong>${b.status}</strong></p>
      <p>Total: <strong>PKR ${b.totalAmount?.toLocaleString()}</strong></p>
      <p style="font-size:12px;color:#666">Bin Yasin Travels | +923018780888</p>
    </body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Package Bookings</h1>
          <p className="text-muted-foreground text-sm mt-1">All Umrah package bookings</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="pl-9 h-9 w-48" data-testid="input-search-packages" />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No package bookings yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {["Ref", "Package", "Hotel", "Duration", "Guests", "Amount", "Status", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((b) => (
                  <motion.tr key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="hover:bg-muted/30 transition-colors" data-testid={`pkg-booking-row-${b.id}`}>
                    <td className="px-4 py-3 font-mono text-xs text-primary">{b.bookingReference}</td>
                    <td className="px-4 py-3 text-foreground text-xs">{(b as any).ticketDetails?.packageName || "Umrah Package"}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{(b as any).ticketDetails?.hotel || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{(b as any).ticketDetails?.duration || "—"} days</td>
                    <td className="px-4 py-3 text-foreground text-xs">{b.passengers?.length || 0} guests</td>
                    <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">PKR {b.totalAmount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[b.status]}`}>{b.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => printTicket(b)} className="h-7 text-xs" data-testid={`button-print-ticket-${b.id}`}>
                          <Printer className="w-3 h-3 mr-1" />Ticket
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => printVoucher(b)} className="h-7 text-xs border-primary/30 text-primary hover:bg-primary/10" data-testid={`button-print-voucher-${b.id}`}>
                          <Hotel className="w-3 h-3 mr-1" />Voucher
                        </Button>
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
