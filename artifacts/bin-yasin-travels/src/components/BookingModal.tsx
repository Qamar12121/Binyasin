import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Plus, Trash2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateBooking, getListBookingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const passengerSchema = z.object({
  title: z.enum(["Mr", "Mrs", "Miss", "Mstr"]),
  givenName: z.string().min(1, "Required"),
  surname: z.string().min(1, "Required"),
  passportNumber: z.string().min(5, "Required"),
  dateOfBirth: z.string().min(1, "Required"),
  dateOfExpiry: z.string().min(1, "Required"),
  mobileNumber: z.string().min(10, "Required"),
  email: z.string().email("Invalid email"),
});

const schema = z.object({ passengers: z.array(passengerSchema).min(1) });
type FormData = z.infer<typeof schema>;

interface Props {
  onClose: () => void;
  type: "group" | "umrah" | "package";
  ticketId?: number;
  packageId?: number;
  ticketInfo: {
    airline?: string;
    origin?: string;
    destination?: string;
    travelDate?: string;
    returnDate?: string;
    price?: number;
    name?: string;
    flightNumber?: string;
    returnFlightNumber?: string;
    departureTime?: string;
    returnTime?: string;
    baggage?: string;
    mealIncluded?: boolean;
    makkahHotel?: string;
    madinahHotel?: string;
    duration?: number;
  };
}

const tdStyle: React.CSSProperties = { padding: "10px 12px", border: "1px solid #ccc" };
const thStyle: React.CSSProperties = { background: "#00a884", color: "white", padding: "10px 12px", textAlign: "left" };
const thGrayStyle: React.CSSProperties = { background: "#d9d9d9", color: "#333", padding: "10px 12px", textAlign: "left", border: "1px solid #999" };
const tdGrayStyle: React.CSSProperties = { padding: "10px 12px", border: "1px solid #999" };

function ETicketPrint({ confirmedBooking, ticketInfo }: { confirmedBooking: any; ticketInfo: Props["ticketInfo"] }) {
  const pax = confirmedBooking.passengers || [];
  const hasReturn = !!(ticketInfo.returnDate || confirmedBooking.ticketDetails?.returnDate);
  const returnDate = ticketInfo.returnDate || confirmedBooking.ticketDetails?.returnDate || "";
  const flightNumber = ticketInfo.flightNumber || confirmedBooking.ticketDetails?.flightNumber || "";
  const returnFlightNumber = ticketInfo.returnFlightNumber || confirmedBooking.ticketDetails?.returnFlightNumber || "";
  const departureTime = ticketInfo.departureTime || confirmedBooking.ticketDetails?.departureTime || "";
  const returnTime = ticketInfo.returnTime || confirmedBooking.ticketDetails?.returnTime || "";
  const baggage = ticketInfo.baggage || "23 KG";
  const meal = ticketInfo.mealIncluded !== false;
  const origin = ticketInfo.origin || confirmedBooking.ticketDetails?.origin || "";
  const destination = ticketInfo.destination || confirmedBooking.ticketDetails?.destination || "Jeddah";
  const travelDate = ticketInfo.travelDate || confirmedBooking.ticketDetails?.travelDate || "";

  return (
    <div style={{ fontFamily: "Arial, Helvetica, sans-serif", background: "#fff", color: "#333" }}>
      <style>{`@media print { .no-print { display: none !important; } }`}</style>

      {/* Header */}
      <div style={{ padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #ddd" }}>
        <div style={{ fontSize: "26px", fontWeight: "bold", color: "#0a8f6a" }}>BIN YASIN TRAVELS</div>
        <div style={{ fontSize: "20px", fontWeight: "bold", color: "#333" }}>E-Ticket Voucher</div>
        <button className="no-print" onClick={() => window.print()} style={{ background: "#00b894", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "5px", cursor: "pointer", fontSize: "14px" }}>
          Print
        </button>
      </div>

      {/* Notice */}
      <div style={{ padding: "12px 20px", color: "#d68910", fontSize: "13px", lineHeight: "22px" }}>
        🔶 Your booking is Partial Confirmed — Ref: <strong>{confirmedBooking.bookingReference}</strong><br />
        Thank you for booking with Bin Yasin Travels.
      </div>

      {/* Passenger Table */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={thStyle}>Passenger Name</th>
            <th style={thStyle}>Passport No</th>
            <th style={thStyle}>Date of Birth</th>
            <th style={thStyle}>Passport Expiry</th>
            <th style={thStyle}>Status</th>
          </tr>
        </thead>
        <tbody>
          {pax.map((p: any, i: number) => (
            <tr key={i}>
              <td style={tdStyle}>{p.title} {p.givenName} {p.surname}</td>
              <td style={tdStyle}>{p.passportNumber}</td>
              <td style={tdStyle}>{p.dateOfBirth}</td>
              <td style={tdStyle}>{p.dateOfExpiry}</td>
              <td style={{ ...tdStyle, color: "#008000", fontWeight: "bold" }}>CONFIRMED</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Outbound Flight */}
      <div style={{ margin: "20px", border: "1px solid #ddd" }}>
        <div style={{ background: "#00a884", color: "#fff", padding: "10px 14px", fontWeight: "bold" }}>
          ✈ Departure from {origin} {flightNumber ? `(Flight ${flightNumber})` : ""}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", padding: "18px" }}>
          <div>
            <h3 style={{ color: "#222", marginBottom: "8px", fontSize: "15px" }}>Departure</h3>
            <p style={{ margin: "3px 0", color: "#555" }}>{travelDate}</p>
            {departureTime && <p style={{ margin: "3px 0", color: "#555" }}>{departureTime}</p>}
            <p style={{ margin: "3px 0", color: "#555" }}>{origin}</p>
            <p style={{ margin: "3px 0", color: "#555" }}>Pakistan</p>
          </div>
          <div>
            <h3 style={{ color: "#222", marginBottom: "8px", fontSize: "15px" }}>Arrival</h3>
            <p style={{ margin: "3px 0", color: "#555" }}>{travelDate}</p>
            <p style={{ margin: "3px 0", color: "#555" }}>—</p>
            <p style={{ margin: "3px 0", color: "#555" }}>{destination}</p>
            <p style={{ margin: "3px 0", color: "#555" }}>Saudi Arabia</p>
          </div>
          <div>
            <h3 style={{ color: "#222", marginBottom: "8px", fontSize: "15px" }}>Details</h3>
            <p style={{ margin: "3px 0", color: "#555" }}>Economy Class</p>
            <p style={{ margin: "3px 0", color: "#555" }}>{baggage} Baggage</p>
            <p style={{ margin: "3px 0", color: "#555" }}>{meal ? "Meal Included" : "No Meal"}</p>
            <p style={{ margin: "3px 0", color: "#555" }}>Seat Unassigned</p>
          </div>
        </div>
      </div>

      {/* Return Flight */}
      {hasReturn && (
        <div style={{ margin: "20px", border: "1px solid #ddd" }}>
          <div style={{ background: "#00a884", color: "#fff", padding: "10px 14px", fontWeight: "bold" }}>
            ✈ Return from {destination} {returnFlightNumber ? `(Flight ${returnFlightNumber})` : ""}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", padding: "18px" }}>
            <div>
              <h3 style={{ color: "#222", marginBottom: "8px", fontSize: "15px" }}>Departure</h3>
              <p style={{ margin: "3px 0", color: "#555" }}>{returnDate}</p>
              {returnTime && <p style={{ margin: "3px 0", color: "#555" }}>{returnTime}</p>}
              <p style={{ margin: "3px 0", color: "#555" }}>{destination}</p>
              <p style={{ margin: "3px 0", color: "#555" }}>Saudi Arabia</p>
            </div>
            <div>
              <h3 style={{ color: "#222", marginBottom: "8px", fontSize: "15px" }}>Arrival</h3>
              <p style={{ margin: "3px 0", color: "#555" }}>{returnDate}</p>
              <p style={{ margin: "3px 0", color: "#555" }}>—</p>
              <p style={{ margin: "3px 0", color: "#555" }}>{origin}</p>
              <p style={{ margin: "3px 0", color: "#555" }}>Pakistan</p>
            </div>
            <div>
              <h3 style={{ color: "#222", marginBottom: "8px", fontSize: "15px" }}>Details</h3>
              <p style={{ margin: "3px 0", color: "#555" }}>Economy Class</p>
              <p style={{ margin: "3px 0", color: "#555" }}>{baggage} Baggage</p>
              <p style={{ margin: "3px 0", color: "#555" }}>{meal ? "Meal Included" : "No Meal"}</p>
              <p style={{ margin: "3px 0", color: "#555" }}>Seat Unassigned</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid #ddd", textAlign: "center", fontSize: "13px", lineHeight: "24px" }}>
        <strong>Emergency Contact</strong><br />
        Agency: BIN YASIN TRAVELS &amp; TOURS &nbsp;|&nbsp; Contact No: 03018780888 &nbsp;|&nbsp; Address: Madni Plaza Near Passport Office New Multan
      </div>
    </div>
  );
}

function HotelVoucherPrint({ confirmedBooking, ticketInfo }: { confirmedBooking: any; ticketInfo: Props["ticketInfo"] }) {
  const pax = confirmedBooking.passengers || [];
  const firstPax = pax[0];
  const flightNumber = ticketInfo.flightNumber || confirmedBooking.ticketDetails?.flightNumber || "";
  const returnFlightNumber = ticketInfo.returnFlightNumber || confirmedBooking.ticketDetails?.returnFlightNumber || "";
  const travelDate = ticketInfo.travelDate || confirmedBooking.ticketDetails?.travelDate || "";
  const returnDate = ticketInfo.returnDate || confirmedBooking.ticketDetails?.returnDate || "";
  const departureTime = ticketInfo.departureTime || confirmedBooking.ticketDetails?.departureTime || "";
  const returnTime = ticketInfo.returnTime || confirmedBooking.ticketDetails?.returnTime || "";
  const origin = ticketInfo.origin || confirmedBooking.ticketDetails?.origin || "MUX";
  const destination = ticketInfo.destination || "JED";
  const baggage = ticketInfo.baggage || "23 KG";
  const meal = ticketInfo.mealIncluded !== false;
  const makkahHotel = ticketInfo.makkahHotel || confirmedBooking.ticketDetails?.makkahHotel || "";
  const madinahHotel = ticketInfo.madinahHotel || confirmedBooking.ticketDetails?.madinahHotel || "";

  return (
    <div style={{ fontFamily: "Arial, Helvetica, sans-serif", background: "#fff", color: "#333", padding: "20px" }}>
      <style>{`@media print { .no-print { display: none !important; } }`}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #ddd", paddingBottom: "15px", marginBottom: "20px" }}>
        <div style={{ fontSize: "28px", fontWeight: "bold", color: "#0b7a75" }}>BIN YASIN TRAVELS</div>
        <button className="no-print" onClick={() => window.print()} style={{ background: "#008c95", color: "#fff", border: "none", padding: "10px 20px", cursor: "pointer", borderRadius: "4px", fontSize: "14px" }}>
          Print Voucher
        </button>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#b59b3b", fontSize: "32px", fontWeight: "bold" }}>Voucher</div>
          <div style={{ fontSize: "15px" }}>Status: <span style={{ color: "green", fontWeight: "bold" }}>Confirmed</span></div>
          <div style={{ fontSize: "14px", color: "#555" }}>#{confirmedBooking.bookingReference}</div>
        </div>
      </div>

      {/* Greeting */}
      <div style={{ lineHeight: "28px", color: "#333", marginBottom: "20px" }}>
        Dear, {firstPax ? `${firstPax.title} ${firstPax.givenName} ${firstPax.surname}` : "Valued Customer"}<br />
        Greetings From <strong style={{ color: "#c0392b" }}>Bin Yasin Travels</strong><br />
        Madni Plaza Near Passport Office New Multan, Punjab Pakistan<br />
        CELL: +92 3018780888 &nbsp;&nbsp; EMAIL: info@binyasintravels.com
      </div>

      {/* Passenger Details */}
      <h2 style={{ fontSize: "20px", color: "#444", margin: "20px 0 10px" }}>Passenger Details</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
        <thead>
          <tr>
            <th style={thGrayStyle}>Type</th>
            <th style={thGrayStyle}>Name</th>
            <th style={thGrayStyle}>Passport No</th>
            <th style={thGrayStyle}>Date of Birth</th>
          </tr>
        </thead>
        <tbody>
          {pax.map((p: any, i: number) => (
            <tr key={i}>
              <td style={tdGrayStyle}>Adult</td>
              <td style={tdGrayStyle}>{p.title} {p.givenName} {p.surname}</td>
              <td style={tdGrayStyle}>{p.passportNumber}</td>
              <td style={tdGrayStyle}>{p.dateOfBirth}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Flight Details */}
      {(flightNumber || travelDate) && (
        <>
          <h2 style={{ fontSize: "20px", color: "#444", margin: "20px 0 10px" }}>Flight Details</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
            <thead>
              <tr>
                <th style={thGrayStyle}>Ref #</th>
                <th style={thGrayStyle}>Flight</th>
                <th style={thGrayStyle}>Departure</th>
                <th style={thGrayStyle}>Sector</th>
                <th style={thGrayStyle}>Baggage</th>
                <th style={thGrayStyle}>Meal</th>
              </tr>
            </thead>
            <tbody>
              {flightNumber && (
                <tr>
                  <td style={tdGrayStyle}>{confirmedBooking.bookingReference}</td>
                  <td style={tdGrayStyle}>{flightNumber}</td>
                  <td style={tdGrayStyle}>{travelDate}{departureTime ? ` / ${departureTime}` : ""}</td>
                  <td style={tdGrayStyle}>{origin} — {destination}</td>
                  <td style={tdGrayStyle}>{baggage}</td>
                  <td style={tdGrayStyle}>{meal ? "Yes" : "No"}</td>
                </tr>
              )}
              {returnFlightNumber && returnDate && (
                <tr>
                  <td style={tdGrayStyle}>{confirmedBooking.bookingReference}</td>
                  <td style={tdGrayStyle}>{returnFlightNumber}</td>
                  <td style={tdGrayStyle}>{returnDate}{returnTime ? ` / ${returnTime}` : ""}</td>
                  <td style={tdGrayStyle}>{destination} — {origin}</td>
                  <td style={tdGrayStyle}>{baggage}</td>
                  <td style={tdGrayStyle}>{meal ? "Yes" : "No"}</td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}

      {/* Hotel Details */}
      {(makkahHotel || madinahHotel) && (
        <>
          <h2 style={{ fontSize: "20px", color: "#444", margin: "20px 0 10px" }}>Hotel Details</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
            <thead>
              <tr>
                <th style={thGrayStyle}>City</th>
                <th style={thGrayStyle}>Hotel</th>
                <th style={thGrayStyle}>Duration</th>
              </tr>
            </thead>
            <tbody>
              {makkahHotel && (
                <tr>
                  <td style={tdGrayStyle}><strong>MAKKAH</strong></td>
                  <td style={tdGrayStyle}>{makkahHotel}</td>
                  <td style={tdGrayStyle}>{ticketInfo.duration ? `${ticketInfo.duration} days` : "—"}</td>
                </tr>
              )}
              {madinahHotel && (
                <tr>
                  <td style={tdGrayStyle}><strong>MADINAH</strong></td>
                  <td style={tdGrayStyle}>{madinahHotel}</td>
                  <td style={tdGrayStyle}>{ticketInfo.duration ? `${ticketInfo.duration} days` : "—"}</td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}

      {/* Package Info */}
      {ticketInfo.name && (
        <div style={{ background: "#f8f8f8", border: "1px solid #ddd", borderRadius: "6px", padding: "12px 16px", marginBottom: "20px", fontSize: "13px" }}>
          <strong>Package:</strong> {ticketInfo.name} &nbsp;|&nbsp; <strong>Total:</strong> PKR {confirmedBooking.totalAmount?.toLocaleString()} &nbsp;|&nbsp; <strong>Pax:</strong> {pax.length}
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: "30px", borderTop: "1px solid #ddd", paddingTop: "18px", color: "#555", lineHeight: "26px", fontSize: "13px" }}>
        I, Check all Umrah Services Voucher Details and Agreed _____________________<br /><br />
        <strong>Booking Notes:</strong> Check your details carefully and inform us immediately if you need any further clarification.<br /><br />
        <em>Software by Bin Yasin Travels Portal</em>
      </div>
    </div>
  );
}

export default function BookingModal({ onClose, type, ticketId, packageId, ticketInfo }: Props) {
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);
  const createBooking = useCreateBooking();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { passengers: [{ title: "Mr", givenName: "", surname: "", passportNumber: "", dateOfBirth: "", dateOfExpiry: "", mobileNumber: "", email: "" }] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "passengers" });

  const onSubmit = (data: FormData) => {
    createBooking.mutate({
      data: { type, ticketId, packageId, passengers: data.passengers as any },
    }, {
      onSuccess: (booking) => {
        queryClient.invalidateQueries({ queryKey: getListBookingsQueryKey() });
        setConfirmedBooking(booking);
        toast({ title: "Booking confirmed!", description: `Reference: ${booking.bookingReference}` });
      },
      onError: () => toast({ title: "Booking failed", variant: "destructive" }),
    });
  };

  if (confirmedBooking) {
    const isPackage = type === "package";
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-white w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-xl shadow-2xl">
          <div id="print-ticket">
            {isPackage
              ? <HotelVoucherPrint confirmedBooking={confirmedBooking} ticketInfo={ticketInfo} />
              : <ETicketPrint confirmedBooking={confirmedBooking} ticketInfo={ticketInfo} />
            }
          </div>
          <div className="no-print flex gap-3 px-6 pb-6 pt-4 border-t border-gray-200 bg-white">
            <Button onClick={() => window.print()} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white" data-testid="button-print-ticket">
              <Printer className="w-4 h-4 mr-2" />Print {isPackage ? "Voucher" : "E-Ticket"}
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1" data-testid="button-close-confirmation">Close</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
          <div>
            <h2 className="font-semibold text-foreground">Booking Form</h2>
            <p className="text-xs text-muted-foreground">{ticketInfo.airline || ticketInfo.name} {ticketInfo.origin && `• ${ticketInfo.origin}${ticketInfo.destination ? " → " + ticketInfo.destination : ""}`}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground" data-testid="button-close-modal"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-5">
          {fields.map((field, index) => (
            <div key={field.id} className="border border-border rounded-xl p-4 space-y-3" data-testid={`passenger-form-${index}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-foreground">Passenger {index + 1}</span>
                {fields.length > 1 && (
                  <button type="button" onClick={() => remove(index)} className="text-red-400 hover:text-red-300 p-1" data-testid={`button-remove-passenger-${index}`}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Title</label>
                  <Select defaultValue="Mr" onValueChange={v => setValue(`passengers.${index}.title`, v as any)}>
                    <SelectTrigger className="h-9" data-testid={`select-title-${index}`}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Mr", "Mrs", "Miss", "Mstr"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Given Name</label>
                  <Input {...register(`passengers.${index}.givenName`)} className="h-9" placeholder="First name" data-testid={`input-given-name-${index}`} />
                  {errors.passengers?.[index]?.givenName && <p className="text-red-400 text-xs mt-0.5">{errors.passengers[index].givenName.message}</p>}
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground mb-1 block">Surname</label>
                  <Input {...register(`passengers.${index}.surname`)} className="h-9" placeholder="Last name" data-testid={`input-surname-${index}`} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Passport Number</label>
                  <Input {...register(`passengers.${index}.passportNumber`)} className="h-9" placeholder="AB1234567" data-testid={`input-passport-${index}`} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Date of Birth</label>
                  <Input {...register(`passengers.${index}.dateOfBirth`)} type="date" className="h-9" data-testid={`input-dob-${index}`} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Passport Expiry</label>
                  <Input {...register(`passengers.${index}.dateOfExpiry`)} type="date" className="h-9" data-testid={`input-doe-${index}`} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Mobile Number</label>
                  <Input {...register(`passengers.${index}.mobileNumber`)} className="h-9" placeholder="+923..." data-testid={`input-mobile-${index}`} />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground mb-1 block">Email</label>
                  <Input {...register(`passengers.${index}.email`)} type="email" className="h-9" placeholder="passenger@email.com" data-testid={`input-pax-email-${index}`} />
                </div>
              </div>
            </div>
          ))}

          <button type="button" onClick={() => append({ title: "Mr", givenName: "", surname: "", passportNumber: "", dateOfBirth: "", dateOfExpiry: "", mobileNumber: "", email: "" })}
            className="flex items-center gap-2 text-primary text-sm hover:text-primary/80 transition-colors" data-testid="button-add-passenger">
            <Plus className="w-4 h-4" />Add Passenger
          </button>

          {ticketInfo.price && (
            <div className="bg-muted rounded-lg p-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total ({fields.length} pax × PKR {ticketInfo.price.toLocaleString()})</span>
              <span className="font-bold text-foreground">PKR {(fields.length * ticketInfo.price).toLocaleString()}</span>
            </div>
          )}

          <div className="flex gap-3">
            <Button type="submit" className="flex-1 bg-primary text-primary-foreground" disabled={createBooking.isPending} data-testid="button-submit-booking">
              {createBooking.isPending ? "Booking..." : "Confirm Booking"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" data-testid="button-cancel-booking">Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
