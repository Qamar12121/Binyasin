import { useState } from "react";
import { motion } from "framer-motion";
import { Filter, Plane } from "lucide-react";
import { useListGroupTickets } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BookingModal from "@/components/BookingModal";

function fmtFullDate(d: string) {
  if (!d) return "—";
  const dt = new Date(d);
  return dt.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

function daysBetween(d1: string, d2: string) {
  if (!d1 || !d2) return null;
  const diff = Math.abs(new Date(d2).getTime() - new Date(d1).getTime());
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function GroupTicketsPage() {
  const [filters, setFilters] = useState({ country: "", airline: "", minPrice: "", maxPrice: "" });
  const [activeCategory, setActiveCategory] = useState<"KSA" | "UAE" | "Qatar">("KSA");
  const [bookingTicket, setBookingTicket] = useState<any>(null);

  const { data: tickets, isLoading } = useListGroupTickets({
    country: filters.country || undefined,
    airline: filters.airline || undefined,
    minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
  });

  const categories: Array<"KSA" | "UAE" | "Qatar"> = ["KSA", "UAE", "Qatar"];
  const filtered = tickets?.filter((t) => t.category === activeCategory && t.status === "active") || [];

  const categoryLabels: Record<string, string> = {
    KSA: "KSA Groups",
    UAE: "UAE Groups",
    Qatar: "Qatar Groups",
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground">Group Tickets</h1>
        <p className="text-muted-foreground text-sm mt-1">Browse available group flights to KSA, UAE, and Qatar</p>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Filters</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Select onValueChange={v => setFilters(p => ({ ...p, country: v === "all" ? "" : v }))}>
            <SelectTrigger className="h-9"><SelectValue placeholder="Country" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>
              <SelectItem value="UAE">UAE</SelectItem>
              <SelectItem value="Qatar">Qatar</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Airline" value={filters.airline} onChange={e => setFilters(p => ({ ...p, airline: e.target.value }))} className="h-9" data-testid="input-filter-airline" />
          <Input placeholder="Min Price (PKR)" value={filters.minPrice} onChange={e => setFilters(p => ({ ...p, minPrice: e.target.value }))} className="h-9" type="number" data-testid="input-filter-min-price" />
          <Input placeholder="Max Price (PKR)" value={filters.maxPrice} onChange={e => setFilters(p => ({ ...p, maxPrice: e.target.value }))} className="h-9" type="number" data-testid="input-filter-max-price" />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2">
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground hover:border-primary/40"}`}
            data-testid={`tab-${cat.toLowerCase()}`}>
            {categoryLabels[cat]}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-44 bg-card border border-border rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <Plane className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No {activeCategory} group tickets available at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((ticket: any, i) => {
            const days = ticket.returnDate ? daysBetween(ticket.travelDate, ticket.returnDate) : null;
            const orig = ticket.originCode || ticket.origin || "";
            const dest = ticket.destinationCode || ticket.destination || "";
            return (
              <motion.div key={ticket.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                style={{ background: "#fff", borderRadius: "10px", overflow: "hidden", border: "1px solid #ddd", boxShadow: "0 3px 8px rgba(0,0,0,0.07)" }}
                data-testid={`ticket-card-${ticket.id}`}>

                {/* Top Bar */}
                <div style={{ background: "#f8f8f8", padding: "11px 20px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", borderBottom: "1px solid #ddd", alignItems: "center" }}>
                  <span style={{ color: "#444", fontSize: "17px", fontWeight: "bold" }}>
                    {ticket.category} GROUP
                  </span>
                  <span style={{ color: "#0c7c59", fontWeight: "bold", fontSize: "13px" }}>
                    {ticket.airline.toUpperCase()}-{orig}-{dest}{ticket.returnDate ? `-${orig}` : ""}
                  </span>
                  {days && (
                    <span style={{ color: "#0c7c59", fontWeight: "bold", fontSize: "13px" }}>
                      Number of Days: {days}
                    </span>
                  )}
                  {ticket.referenceCode && (
                    <span style={{ color: "#0c7c59", fontWeight: "bold", fontSize: "13px" }}>
                      {ticket.referenceCode}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "0", padding: "18px 20px", alignItems: "center" }}>

                  {/* Airline + Flights */}
                  <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                    <div style={{ width: "90px", height: "50px", background: "#f5f5f5", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "bold", color: "#555", flexShrink: 0, textAlign: "center", padding: "4px" }}>
                      {ticket.airline}
                    </div>
                    <div>
                      <div style={{ color: "#f39c12", marginBottom: "8px", fontSize: "20px", fontWeight: "bold" }}>
                        {ticket.airline.toUpperCase()}
                      </div>
                      {ticket.flightNumber && (
                        <div style={{ fontSize: "13px", color: "#555", lineHeight: "24px" }}>
                          1) {ticket.flightNumber} {ticket.travelDate ? new Date(ticket.travelDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : ""} {orig}-{dest}{ticket.departureTime ? ` ${ticket.departureTime}` : ""}{ticket.arrivalTime ? ` - ${ticket.arrivalTime}` : ""}
                        </div>
                      )}
                      {ticket.returnFlightNumber && ticket.returnDate && (
                        <div style={{ fontSize: "13px", color: "#555", lineHeight: "24px" }}>
                          2) {ticket.returnFlightNumber} {new Date(ticket.returnDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} {dest}-{orig}{ticket.returnTime ? ` ${ticket.returnTime}` : ""}{ticket.returnArrivalTime ? ` - ${ticket.returnArrivalTime}` : ""}
                        </div>
                      )}
                      <div style={{ fontSize: "13px", color: "#555", lineHeight: "24px" }}>
                        {ticket.baggage || "23 KG"} Baggage {ticket.mealIncluded !== false ? "• Meal ✓" : ""}
                      </div>
                    </div>
                  </div>

                  {/* Seats */}
                  <div style={{ borderLeft: "1px solid #ddd", paddingLeft: "16px" }}>
                    <div style={{ color: "#777", marginBottom: "8px", fontSize: "16px", fontWeight: "bold" }}>Seats</div>
                    <div style={{ lineHeight: "26px", fontSize: "13px" }}>Total Seats: {ticket.totalSeats || ticket.seatsAvailable}</div>
                    <div style={{ lineHeight: "26px", fontSize: "13px" }}>Available: <span style={{ color: "#0c7c59", fontWeight: "bold" }}>{ticket.seatsAvailable}</span></div>
                  </div>

                  {/* Dep Date */}
                  <div style={{ borderLeft: "1px solid #ddd", paddingLeft: "16px" }}>
                    <div style={{ color: "#777", marginBottom: "8px", fontSize: "16px", fontWeight: "bold" }}>Dep Date</div>
                    <div style={{ lineHeight: "26px", fontSize: "13px" }}>{fmtFullDate(ticket.travelDate)}</div>
                  </div>

                  {/* Price + Book */}
                  <div style={{ borderLeft: "1px solid #ddd", paddingLeft: "16px" }}>
                    <div style={{ color: "#777", marginBottom: "6px", fontSize: "16px", fontWeight: "bold" }}>Price</div>
                    <div style={{ color: "#0c7c59", fontSize: "26px", fontWeight: "bold" }}>
                      PKR {ticket.price.toLocaleString()}
                    </div>
                    <button onClick={() => setBookingTicket(ticket)}
                      style={{ background: "#f39c12", border: "none", color: "#fff", padding: "11px 18px", borderRadius: "5px", fontSize: "14px", cursor: "pointer", marginTop: "10px", width: "100%", fontWeight: "bold" }}
                      data-testid={`button-book-${ticket.id}`}>
                      BOOK NOW
                    </button>
                  </div>

                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {bookingTicket && (
        <BookingModal
          onClose={() => setBookingTicket(null)}
          type="group"
          ticketId={bookingTicket.id}
          ticketInfo={{
            airline: bookingTicket.airline,
            origin: bookingTicket.originCode || bookingTicket.origin,
            destination: bookingTicket.destinationCode || bookingTicket.destination,
            travelDate: bookingTicket.travelDate,
            returnDate: bookingTicket.returnDate,
            price: bookingTicket.price,
            flightNumber: bookingTicket.flightNumber,
            returnFlightNumber: bookingTicket.returnFlightNumber,
            departureTime: bookingTicket.departureTime,
            returnTime: bookingTicket.returnTime,
            baggage: bookingTicket.baggage,
            mealIncluded: bookingTicket.mealIncluded,
          }}
        />
      )}
    </div>
  );
}
