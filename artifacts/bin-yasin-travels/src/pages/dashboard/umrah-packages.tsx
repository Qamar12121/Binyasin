import { useState } from "react";
import { motion } from "framer-motion";
import { Package } from "lucide-react";
import { useListUmrahPackages } from "@workspace/api-client-react";
import BookingModal from "@/components/BookingModal";

function fmtDate(d: string) {
  if (!d) return "—";
  const dt = new Date(d);
  return dt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function fmtShort(d: string) {
  if (!d) return "—";
  const dt = new Date(d);
  return dt.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function UmrahPackagesPage() {
  const [bookingPkg, setBookingPkg] = useState<any>(null);
  const { data: packages, isLoading } = useListUmrahPackages();
  const active = packages?.filter((p) => p.status === "active") || [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground">Umrah Packages</h1>
        <p className="text-muted-foreground text-sm mt-1">Complete Umrah packages with hotel, transport and visa</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {[1, 2].map((i) => <div key={i} className="h-[600px] bg-card border border-border rounded-2xl animate-pulse" />)}
        </div>
      ) : active.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-2xl">
          <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No packages available. Contact admin for package listings.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {active.map((pkg: any, i) => (
            <motion.div key={pkg.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              style={{ background: "#fff", borderRadius: "18px", border: "1px solid #dfe6e9", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", transition: "0.3s" }}
              className="hover:-translate-y-1"
              data-testid={`package-card-${pkg.id}`}>

              {/* Airline Logo */}
              <div style={{ textAlign: "center", padding: "22px 20px 8px" }}>
                {pkg.image ? (
                  <img src={pkg.image} alt={pkg.name} style={{ maxWidth: "200px", maxHeight: "60px", objectFit: "contain" }} />
                ) : (
                  <div style={{ display: "inline-block", background: "#f0f0f0", borderRadius: "8px", padding: "10px 24px", fontSize: "18px", fontWeight: "bold", color: "#0a8f6a", letterSpacing: "1px" }}>
                    {pkg.name}
                  </div>
                )}
              </div>

              {/* Date Row */}
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "12px", padding: "10px 20px 18px" }}>
                <div style={{ flex: 1, background: "#fff", border: "1px solid #dfe6e9", borderRadius: "12px", textAlign: "center", padding: "10px" }}>
                  <div style={{ color: "#7f8c8d", fontSize: "11px", marginBottom: "6px", fontWeight: "bold" }}>DEPARTURE</div>
                  <div style={{ fontWeight: "bold", color: "#2d3436", fontSize: "15px" }}>{fmtDate(pkg.travelDate)}</div>
                </div>
                <div style={{ background: "#dff9fb", color: "#0984e3", padding: "8px 14px", borderRadius: "30px", fontSize: "12px", fontWeight: "bold", whiteSpace: "nowrap" }}>
                  {pkg.duration} Days
                </div>
                <div style={{ flex: 1, background: "#fff", border: "1px solid #dfe6e9", borderRadius: "12px", textAlign: "center", padding: "10px" }}>
                  <div style={{ color: "#7f8c8d", fontSize: "11px", marginBottom: "6px", fontWeight: "bold" }}>RETURN</div>
                  <div style={{ fontWeight: "bold", color: "#2d3436", fontSize: "15px" }}>{fmtDate(pkg.returnDate)}</div>
                </div>
              </div>

              {/* Flight Details */}
              {(pkg.flightNumber || pkg.travelDate) && (
                <div style={{ padding: "0 18px 8px" }}>
                  {pkg.flightNumber && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed #dcdde1", padding: "9px 0", fontSize: "13px", color: "#2d3436", gap: "8px" }}>
                      <span style={{ fontWeight: "bold" }}>{pkg.originCode || pkg.originCity || "—"} ➜ {pkg.destinationCode || "JED"}</span>
                      <span>{fmtShort(pkg.travelDate)}</span>
                      <span>{pkg.departureTime || ""}{pkg.arrivalTime ? ` - ${pkg.arrivalTime}` : ""}</span>
                      <span>{pkg.baggage || "20 KG"}</span>
                      <span title="Meal Included">🍽️</span>
                    </div>
                  )}
                  {pkg.returnFlightNumber && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", fontSize: "13px", color: "#2d3436", gap: "8px" }}>
                      <span style={{ fontWeight: "bold" }}>{pkg.destinationCode || "JED"} ➜ {pkg.originCode || pkg.originCity || "—"}</span>
                      <span>{fmtShort(pkg.returnDate)}</span>
                      <span>{pkg.returnTime || ""}{pkg.returnArrivalTime ? ` - ${pkg.returnArrivalTime}` : ""}</span>
                      <span>{pkg.baggage || "20 KG"}</span>
                      <span title="Meal Included">🍽️</span>
                    </div>
                  )}
                </div>
              )}

              {/* Makkah Hotel */}
              {pkg.makkahHotel && (
                <div style={{ margin: "8px 18px", background: "#fff", border: "1px solid #dfe6e9", borderRadius: "12px", padding: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <span style={{ color: "#c0392b", fontSize: "20px" }}>🏨</span>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: "bold", marginBottom: "4px", color: "#2d3436" }}>{pkg.makkahHotel}</div>
                      <div style={{ fontSize: "12px", color: "#7f8c8d" }}>{pkg.makkahHotelDistance || "Makkah"}</div>
                    </div>
                  </div>
                  <div style={{ color: "#16a085", fontSize: "13px", fontWeight: "bold", whiteSpace: "nowrap" }}>
                    🌙 {pkg.makkahNights ?? "—"} Nights
                  </div>
                </div>
              )}

              {/* Madinah Hotel */}
              {pkg.madinahHotel && (
                <div style={{ margin: "8px 18px", background: "#fff", border: "1px solid #dfe6e9", borderRadius: "12px", padding: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <span style={{ fontSize: "20px" }}>🕌</span>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: "bold", marginBottom: "4px", color: "#2d3436" }}>{pkg.madinahHotel}</div>
                      <div style={{ fontSize: "12px", color: "#7f8c8d" }}>{pkg.madinahHotelDistance || "Madinah"}</div>
                    </div>
                  </div>
                  <div style={{ color: "#16a085", fontSize: "13px", fontWeight: "bold", whiteSpace: "nowrap" }}>
                    🌙 {pkg.madinahNights ?? "—"} Nights
                  </div>
                </div>
              )}

              {/* Fallback hotel if no separate makkah/madinah */}
              {!pkg.makkahHotel && !pkg.madinahHotel && pkg.hotel && (
                <div style={{ margin: "8px 18px", background: "#fff", border: "1px solid #dfe6e9", borderRadius: "12px", padding: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <span style={{ color: "#c0392b", fontSize: "20px" }}>🏨</span>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: "bold", marginBottom: "4px", color: "#2d3436" }}>{pkg.hotel}</div>
                      <div style={{ fontSize: "12px", color: "#7f8c8d" }}>{"⭐".repeat(pkg.hotelStars)} Hotel</div>
                    </div>
                  </div>
                  <div style={{ color: "#16a085", fontSize: "13px", fontWeight: "bold" }}>
                    🌙 {pkg.duration} Days
                  </div>
                </div>
              )}

              {/* Transport */}
              <div style={{ margin: "12px 18px", padding: "12px 16px", border: "1px solid #dfe6e9", borderRadius: "12px", fontSize: "14px", fontWeight: "bold", color: "#34495e", background: "#fafafa" }}>
                🚌 {pkg.transport}
              </div>

              {/* Price Grid */}
              {(pkg.priceShared || pkg.priceDouble || pkg.priceTriple || pkg.priceQuad) ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px", padding: "0 18px 16px" }}>
                  {pkg.priceShared && (
                    <div style={{ background: "#fafafa", border: "1px solid #dfe6e9", borderRadius: "12px", textAlign: "center", padding: "10px 6px" }}>
                      <div style={{ fontSize: "10px", color: "#7f8c8d", marginBottom: "5px", fontWeight: "bold" }}>👥 SHARED</div>
                      <div style={{ fontSize: "13px", fontWeight: "bold", color: "#2d3436" }}>PKR {Number(pkg.priceShared).toLocaleString()}</div>
                    </div>
                  )}
                  {pkg.priceDouble && (
                    <div style={{ background: "#fafafa", border: "1px solid #dfe6e9", borderRadius: "12px", textAlign: "center", padding: "10px 6px" }}>
                      <div style={{ fontSize: "10px", color: "#7f8c8d", marginBottom: "5px", fontWeight: "bold" }}>👥 DOUBLE</div>
                      <div style={{ fontSize: "13px", fontWeight: "bold", color: "#2d3436" }}>PKR {Number(pkg.priceDouble).toLocaleString()}</div>
                    </div>
                  )}
                  {pkg.priceTriple && (
                    <div style={{ background: "#fafafa", border: "1px solid #dfe6e9", borderRadius: "12px", textAlign: "center", padding: "10px 6px" }}>
                      <div style={{ fontSize: "10px", color: "#7f8c8d", marginBottom: "5px", fontWeight: "bold" }}>👥 TRIPLE</div>
                      <div style={{ fontSize: "13px", fontWeight: "bold", color: "#2d3436" }}>PKR {Number(pkg.priceTriple).toLocaleString()}</div>
                    </div>
                  )}
                  {pkg.priceQuad && (
                    <div style={{ background: "#fafafa", border: "1px solid #dfe6e9", borderRadius: "12px", textAlign: "center", padding: "10px 6px" }}>
                      <div style={{ fontSize: "10px", color: "#7f8c8d", marginBottom: "5px", fontWeight: "bold" }}>👥 QUAD</div>
                      <div style={{ fontSize: "13px", fontWeight: "bold", color: "#2d3436" }}>PKR {Number(pkg.priceQuad).toLocaleString()}</div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ padding: "0 18px 16px" }}>
                  <div style={{ background: "#fafafa", border: "1px solid #dfe6e9", borderRadius: "12px", textAlign: "center", padding: "12px" }}>
                    <div style={{ fontSize: "11px", color: "#7f8c8d", marginBottom: "5px" }}>PRICE PER PERSON</div>
                    <div style={{ fontSize: "20px", fontWeight: "bold", color: "#0c7c59" }}>PKR {Number(pkg.price).toLocaleString()}</div>
                  </div>
                </div>
              )}

              {/* Bottom Bar */}
              <div style={{ borderTop: "1px solid #ecf0f1", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fafafa" }}>
                <div style={{ fontSize: "13px", fontWeight: "bold", color: "#27ae60" }}>
                  🟢 {pkg.seatsAvailable ?? "—"} Seats Available
                </div>
                <button onClick={() => setBookingPkg(pkg)}
                  style={{ background: "#f39c12", color: "#fff", border: "none", padding: "11px 24px", borderRadius: "30px", fontSize: "13px", cursor: "pointer", fontWeight: "bold" }}
                  data-testid={`button-book-pkg-${pkg.id}`}>
                  BOOK NOW
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {bookingPkg && (
        <BookingModal onClose={() => setBookingPkg(null)} type="package" packageId={bookingPkg.id}
          ticketInfo={{
            name: bookingPkg.name,
            price: bookingPkg.price,
            makkahHotel: bookingPkg.makkahHotel,
            madinahHotel: bookingPkg.madinahHotel,
            flightNumber: bookingPkg.flightNumber,
            returnFlightNumber: bookingPkg.returnFlightNumber,
            origin: bookingPkg.originCode || bookingPkg.originCity,
            destination: bookingPkg.destinationCode || "JED",
            travelDate: bookingPkg.travelDate,
            returnDate: bookingPkg.returnDate,
            departureTime: bookingPkg.departureTime,
            returnTime: bookingPkg.returnTime,
            baggage: bookingPkg.baggage,
            mealIncluded: bookingPkg.mealIncluded,
            duration: bookingPkg.duration,
          }} />
      )}
    </div>
  );
}
