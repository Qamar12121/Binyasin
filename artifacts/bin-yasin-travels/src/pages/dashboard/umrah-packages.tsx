import { useState } from "react";
import { motion } from "framer-motion";
import { Package, Hotel, Bus, CheckCircle, Clock } from "lucide-react";
import { useListUmrahPackages } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BookingModal from "@/components/BookingModal";

const tierColors: Record<string, string> = {
  economy: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  vip: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  luxury: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
};

export default function UmrahPackagesPage() {
  const [bookingPkg, setBookingPkg] = useState<any>(null);
  const { data: packages, isLoading } = useListUmrahPackages();
  const active = packages?.filter(p => p.status === "active") || [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground">Umrah Packages</h1>
        <p className="text-muted-foreground text-sm mt-1">Complete Umrah packages with hotel, transport and visa</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-72 bg-card border border-border rounded-xl animate-pulse" />)}
        </div>
      ) : active.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-xl">
          <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No packages available. Contact admin for package listings.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {active.map((pkg, i) => (
            <motion.div key={pkg.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className={`bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-all ${pkg.tier === "luxury" ? "border-primary/50 shadow-primary/5 shadow-md" : "border-border hover:border-primary/30"}`}
              data-testid={`package-card-${pkg.id}`}>
              {pkg.tier === "luxury" && <div className="bg-primary text-primary-foreground text-center py-1.5 text-xs font-semibold tracking-wide">MOST POPULAR</div>}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <Badge variant="outline" className={`text-xs mb-2 ${tierColors[pkg.tier]}`}>{pkg.tier.toUpperCase()}</Badge>
                    <h3 className="font-serif font-bold text-foreground text-lg">{pkg.name}</h3>
                  </div>
                  <div className="text-right">
                    {"⭐".repeat(pkg.hotelStars)}
                  </div>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">{pkg.description}</p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Hotel className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-foreground">{pkg.hotel}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Bus className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-foreground">{pkg.transport}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-foreground">{pkg.duration} days</span>
                  </div>
                  {pkg.visaIncluded && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-green-400">Visa Included</span>
                    </div>
                  )}
                </div>
                {pkg.amenities?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {pkg.amenities.slice(0, 4).map((a, j) => (
                      <span key={j} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{a}</span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div>
                    <div className="text-xs text-muted-foreground">Starting from</div>
                    <div className="font-serif text-xl font-bold text-primary">PKR {pkg.price.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">per person</div>
                  </div>
                  <Button className={`${pkg.tier === "luxury" ? "bg-primary text-primary-foreground" : "bg-primary text-primary-foreground"}`}
                    onClick={() => setBookingPkg(pkg)} data-testid={`button-book-pkg-${pkg.id}`}>
                    Book Now
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {bookingPkg && (
        <BookingModal onClose={() => setBookingPkg(null)} type="package" packageId={bookingPkg.id}
          ticketInfo={{ name: bookingPkg.name, price: bookingPkg.price }} />
      )}
    </div>
  );
}
