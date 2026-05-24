import { useState } from "react";
import { motion } from "framer-motion";
import { Plane } from "lucide-react";
import { useListUmrahTickets } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BookingModal from "@/components/BookingModal";

export default function UmrahTicketsPage() {
  const [bookingTicket, setBookingTicket] = useState<any>(null);
  const { data: tickets, isLoading } = useListUmrahTickets();
  const active = tickets?.filter(t => t.status === "active") || [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground">Umrah Tickets</h1>
        <p className="text-muted-foreground text-sm mt-1">Book dedicated Umrah flights for your clients</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-48 bg-card border border-border rounded-xl animate-pulse" />)}
        </div>
      ) : active.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-xl">
          <Plane className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No Umrah tickets available at the moment. Check back soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {active.map((ticket, i) => (
            <motion.div key={ticket.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-xl p-5 hover:border-primary/40 hover:shadow-sm transition-all" data-testid={`umrah-ticket-${ticket.id}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Plane className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">{ticket.airline}</div>
                  {ticket.flightNumber && <div className="text-xs text-muted-foreground">{ticket.flightNumber}</div>}
                </div>
              </div>
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center gap-2">
                  <Plane className="w-3 h-3 text-muted-foreground" />
                  <span className="text-foreground">{ticket.origin} → Makkah</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-muted-foreground">Depart:</span> <span className="text-foreground">{ticket.travelDate}</span></div>
                  <div><span className="text-muted-foreground">Return:</span> <span className="text-foreground">{ticket.returnDate}</span></div>
                  <div><span className="text-muted-foreground">Seats:</span> <span className="text-foreground font-medium">{ticket.seatsAvailable}</span></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Price/Pax</div>
                  <div className="font-serif text-lg font-bold text-primary">PKR {ticket.price.toLocaleString()}</div>
                </div>
                <Button size="sm" className="bg-primary text-primary-foreground" onClick={() => setBookingTicket(ticket)} data-testid={`button-book-umrah-${ticket.id}`}>
                  Book Now
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {bookingTicket && (
        <BookingModal onClose={() => setBookingTicket(null)} type="umrah" ticketId={bookingTicket.id}
          ticketInfo={{
            airline: bookingTicket.airline,
            origin: bookingTicket.origin,
            destination: "Jeddah",
            travelDate: bookingTicket.travelDate,
            returnDate: bookingTicket.returnDate,
            price: bookingTicket.price,
            flightNumber: bookingTicket.flightNumber,
            returnFlightNumber: bookingTicket.returnFlightNumber,
            departureTime: bookingTicket.departureTime,
            returnTime: bookingTicket.returnTime,
            baggage: bookingTicket.baggage,
            mealIncluded: bookingTicket.mealIncluded,
          }} />
      )}
    </div>
  );
}
