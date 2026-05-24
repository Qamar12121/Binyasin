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
  ticketInfo: { airline?: string; origin?: string; destination?: string; travelDate?: string; price?: number; name?: string };
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
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div id="print-ticket" className="p-6">
            <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
              <div>
                <div className="font-serif text-xl font-bold text-primary">Bin Yasin Travels</div>
                <div className="text-muted-foreground text-xs">Travel Booking Confirmation</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-foreground">{confirmedBooking.bookingReference}</div>
                <div className="text-xs text-muted-foreground">{new Date(confirmedBooking.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div><span className="text-muted-foreground">Type:</span> <span className="font-medium capitalize text-foreground">{confirmedBooking.type} Booking</span></div>
              <div><span className="text-muted-foreground">Status:</span> <span className="font-medium text-yellow-400 capitalize">{confirmedBooking.status}</span></div>
              {confirmedBooking.ticketDetails?.airline && <div><span className="text-muted-foreground">Airline:</span> <span className="font-medium text-foreground">{confirmedBooking.ticketDetails.airline}</span></div>}
              {confirmedBooking.ticketDetails?.origin && <div><span className="text-muted-foreground">Route:</span> <span className="font-medium text-foreground">{confirmedBooking.ticketDetails.origin}{confirmedBooking.ticketDetails.destination ? ` → ${confirmedBooking.ticketDetails.destination}` : ""}</span></div>}
              {confirmedBooking.ticketDetails?.travelDate && <div><span className="text-muted-foreground">Date:</span> <span className="font-medium text-foreground">{confirmedBooking.ticketDetails.travelDate}</span></div>}
              <div><span className="text-muted-foreground">Total:</span> <span className="font-bold text-primary">PKR {confirmedBooking.totalAmount.toLocaleString()}</span></div>
            </div>
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-muted px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Passengers</div>
              {confirmedBooking.passengers.map((p: any, i: number) => (
                <div key={i} className="px-4 py-3 border-t border-border grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Name:</span> <span className="font-medium text-foreground">{p.title} {p.givenName} {p.surname}</span></div>
                  <div><span className="text-muted-foreground">Passport:</span> <span className="font-medium text-foreground">{p.passportNumber}</span></div>
                  <div><span className="text-muted-foreground">DOB:</span> <span className="font-medium text-foreground">{p.dateOfBirth}</span></div>
                  <div><span className="text-muted-foreground">DOE:</span> <span className="font-medium text-foreground">{p.dateOfExpiry}</span></div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-muted rounded-lg text-xs text-muted-foreground text-center">
              Bin Yasin Travels • +923018780888 • info@binyasintravels.com
            </div>
          </div>
          <div className="no-print flex gap-3 px-6 pb-6">
            <Button onClick={() => window.print()} className="flex-1 bg-primary text-primary-foreground" data-testid="button-print-ticket">
              <Printer className="w-4 h-4 mr-2" />Print Ticket
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
