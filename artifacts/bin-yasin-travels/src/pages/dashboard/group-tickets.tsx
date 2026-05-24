import { useState } from "react";
import { motion } from "framer-motion";
import { Plane, Filter, Search } from "lucide-react";
import { useListGroupTickets, getListGroupTicketsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import BookingModal from "@/components/BookingModal";

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
  const filtered = tickets?.filter(t => t.category === activeCategory && t.status === "active") || [];

  const categoryLabels: Record<string, string> = {
    KSA: "KSA One Way Groups",
    UAE: "UAE One Way Groups",
    Qatar: "Qatar One Way Groups",
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-48 bg-card border border-border rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-xl">
          <Plane className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No {activeCategory} group tickets available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((ticket, i) => (
            <motion.div key={ticket.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-xl p-5 hover:border-primary/40 hover:shadow-sm transition-all" data-testid={`ticket-card-${ticket.id}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Plane className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm">{ticket.airline}</div>
                    {ticket.flightNumber && <div className="text-xs text-muted-foreground">{ticket.flightNumber}</div>}
                  </div>
                </div>
                <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">{ticket.category}</Badge>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Plane className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-foreground font-medium">{ticket.origin}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="text-foreground font-medium">{ticket.destination}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Date: <span className="text-foreground">{ticket.travelDate}</span></span>
                  <span className="text-muted-foreground">Seats: <span className="text-foreground font-medium">{ticket.seatsAvailable}</span></span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Price/Pax</div>
                  <div className="font-serif text-lg font-bold text-primary">PKR {ticket.price.toLocaleString()}</div>
                </div>
                <Button size="sm" className="bg-primary text-primary-foreground"
                  onClick={() => setBookingTicket(ticket)} data-testid={`button-book-${ticket.id}`}>
                  Book Now
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {bookingTicket && (
        <BookingModal
          onClose={() => setBookingTicket(null)}
          type="group"
          ticketId={bookingTicket.id}
          ticketInfo={{ airline: bookingTicket.airline, origin: bookingTicket.origin, destination: bookingTicket.destination, travelDate: bookingTicket.travelDate, price: bookingTicket.price }}
        />
      )}
    </div>
  );
}
