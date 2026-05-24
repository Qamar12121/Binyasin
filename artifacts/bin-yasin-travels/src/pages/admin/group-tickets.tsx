import { useState } from "react";
import { motion } from "framer-motion";
import { Plane, Plus, Trash2, Edit2, Save } from "lucide-react";
import { useListGroupTickets, useCreateGroupTicket, useUpdateGroupTicket, useDeleteGroupTicket, getListGroupTicketsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";

const schema = z.object({
  airline: z.string().min(1, "Required"),
  flightNumber: z.string().optional(),
  origin: z.string().min(1, "Required"),
  originCode: z.string().optional(),
  destination: z.string().min(1, "Required"),
  destinationCode: z.string().optional(),
  country: z.string().min(1, "Required"),
  category: z.enum(["KSA", "UAE", "Qatar"]),
  travelDate: z.string().min(1, "Required"),
  departureTime: z.string().optional(),
  arrivalTime: z.string().optional(),
  returnDate: z.string().optional(),
  returnFlightNumber: z.string().optional(),
  returnTime: z.string().optional(),
  returnArrivalTime: z.string().optional(),
  baggage: z.string().optional(),
  mealIncluded: z.boolean().optional(),
  seatsAvailable: z.number().min(1, "Required"),
  totalSeats: z.number().optional(),
  referenceCode: z.string().optional(),
  price: z.number().min(1, "Required"),
});
type FormData = z.infer<typeof schema>;

const defaultValues: FormData = { airline: "", flightNumber: "", origin: "", originCode: "", destination: "", destinationCode: "", country: "Saudi Arabia", category: "KSA", travelDate: "", departureTime: "", arrivalTime: "", returnDate: "", returnFlightNumber: "", returnTime: "", returnArrivalTime: "", baggage: "23 KG", mealIncluded: true, seatsAvailable: 30, totalSeats: 30, referenceCode: "", price: 50000 };

export default function AdminGroupTicketsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { data: tickets, isLoading } = useListGroupTickets({});
  const createTicket = useCreateGroupTicket();
  const updateTicket = useUpdateGroupTicket();
  const deleteTicket = useDeleteGroupTicket();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const qKey = getListGroupTicketsQueryKey({});

  const onSubmit = (data: FormData) => {
    if (editingId) {
      updateTicket.mutate({ id: editingId, data } as any, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: qKey }); setShowForm(false); setEditingId(null); reset(); toast({ title: "Ticket updated" }); },
        onError: () => toast({ title: "Update failed", variant: "destructive" }),
      });
    } else {
      createTicket.mutate({ data } as any, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: qKey }); setShowForm(false); reset(); toast({ title: "Ticket created" }); },
        onError: () => toast({ title: "Create failed", variant: "destructive" }),
      });
    }
  };

  const handleEdit = (t: any) => {
    setEditingId(t.id);
    reset({ airline: t.airline, flightNumber: t.flightNumber || "", origin: t.origin, originCode: t.originCode || "", destination: t.destination, destinationCode: t.destinationCode || "", country: t.country, category: t.category, travelDate: t.travelDate, departureTime: t.departureTime || "", arrivalTime: t.arrivalTime || "", returnDate: t.returnDate || "", returnFlightNumber: t.returnFlightNumber || "", returnTime: t.returnTime || "", returnArrivalTime: t.returnArrivalTime || "", baggage: t.baggage || "23 KG", mealIncluded: t.mealIncluded !== false, seatsAvailable: t.seatsAvailable, totalSeats: t.totalSeats || t.seatsAvailable, referenceCode: t.referenceCode || "", price: t.price });
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this ticket?")) return;
    deleteTicket.mutate({ id }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: qKey }); toast({ title: "Ticket deleted" }); } });
  };

  const statusColors: Record<string, string> = { active: "bg-green-500/10 text-green-400 border-green-500/20", soldout: "bg-red-500/10 text-red-400 border-red-500/20", cancelled: "bg-gray-500/10 text-gray-400 border-gray-500/20" };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Group Tickets</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage all group flight listings</p>
        </div>
        <Button onClick={() => { setShowForm(!showForm); setEditingId(null); reset(defaultValues); }} className="bg-primary text-primary-foreground" data-testid="button-add-ticket">
          <Plus className="w-4 h-4 mr-2" />{showForm ? "Cancel" : "Add Ticket"}
        </Button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-5" data-testid="form-add-ticket">
          <h3 className="font-semibold text-foreground mb-4">{editingId ? "Edit Ticket" : "New Group Ticket"}</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">

            <p className="text-xs font-semibold text-primary uppercase tracking-wide">Basic Info</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Airline *</label>
                <Input {...register("airline")} placeholder="Airblue, PIA..." className="h-9" data-testid="input-airline" />
                {errors.airline && <p className="text-red-400 text-xs">{errors.airline.message}</p>}
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Reference Code</label>
                <Input {...register("referenceCode")} placeholder="AG-3116" className="h-9" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Category *</label>
                <Select defaultValue="KSA" onValueChange={v => setValue("category", v as any)}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KSA">KSA</SelectItem>
                    <SelectItem value="UAE">UAE</SelectItem>
                    <SelectItem value="Qatar">Qatar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Country *</label>
                <Input {...register("country")} placeholder="Saudi Arabia" className="h-9" />
              </div>
            </div>

            <p className="text-xs font-semibold text-primary uppercase tracking-wide mt-1">Route</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Origin City *</label>
                <Input {...register("origin")} placeholder="Lahore" className="h-9" data-testid="input-origin" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Origin Code</label>
                <Input {...register("originCode")} placeholder="LHE" className="h-9" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Destination *</label>
                <Input {...register("destination")} placeholder="Jeddah" className="h-9" data-testid="input-destination" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Destination Code</label>
                <Input {...register("destinationCode")} placeholder="JED" className="h-9" />
              </div>
            </div>

            <p className="text-xs font-semibold text-primary uppercase tracking-wide mt-1">Outbound Flight</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Flight No.</label>
                <Input {...register("flightNumber")} placeholder="PA 472" className="h-9" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Travel Date *</label>
                <Input {...register("travelDate")} type="date" className="h-9" data-testid="input-travel-date" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Dep Time</label>
                <Input {...register("departureTime")} placeholder="23:55" className="h-9" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Arrival Time</label>
                <Input {...register("arrivalTime")} placeholder="03:15" className="h-9" />
              </div>
            </div>

            <p className="text-xs font-semibold text-primary uppercase tracking-wide mt-1">Return Flight</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Return Flight No.</label>
                <Input {...register("returnFlightNumber")} placeholder="PA 471" className="h-9" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Return Date</label>
                <Input {...register("returnDate")} type="date" className="h-9" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Return Dep Time</label>
                <Input {...register("returnTime")} placeholder="04:30" className="h-9" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Return Arr Time</label>
                <Input {...register("returnArrivalTime")} placeholder="12:00" className="h-9" />
              </div>
            </div>

            <p className="text-xs font-semibold text-primary uppercase tracking-wide mt-1">Seats & Pricing</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Total Seats</label>
                <Input {...register("totalSeats", { valueAsNumber: true })} type="number" className="h-9" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Available Seats *</label>
                <Input {...register("seatsAvailable", { valueAsNumber: true })} type="number" className="h-9" data-testid="input-seats" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Price (PKR) *</label>
                <Input {...register("price", { valueAsNumber: true })} type="number" className="h-9" data-testid="input-price" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Baggage</label>
                <Input {...register("baggage")} placeholder="23 KG" className="h-9" />
              </div>
              <div className="flex items-center gap-2 pb-1">
                <input {...register("mealIncluded")} type="checkbox" id="mealIncluded" className="w-4 h-4" defaultChecked />
                <label htmlFor="mealIncluded" className="text-sm text-foreground">Meal Included</label>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button type="submit" className="bg-primary text-primary-foreground" disabled={createTicket.isPending || updateTicket.isPending} data-testid="button-save-ticket">
                <Save className="w-4 h-4 mr-2" />{editingId ? "Update" : "Create Ticket"}
              </Button>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); reset(); }}>Cancel</Button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 bg-muted rounded animate-pulse" />)}</div>
        ) : !tickets?.length ? (
          <div className="p-12 text-center"><Plane className="w-8 h-8 text-muted-foreground mx-auto mb-2" /><p className="text-muted-foreground text-sm">No tickets yet.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/50">
                {["Airline", "Ref", "Route", "Cat", "Date", "Dep", "Arr", "Ret Date", "Ret Dep", "Baggage", "Seats", "Price", "Status", ""].map(h => (
                  <th key={h} className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-border">
                {tickets.map((t: any) => (
                  <tr key={t.id} className="hover:bg-muted/30" data-testid={`admin-ticket-row-${t.id}`}>
                    <td className="px-3 py-3 font-medium text-foreground whitespace-nowrap">{t.airline}</td>
                    <td className="px-3 py-3 text-muted-foreground text-xs">{t.referenceCode || "—"}</td>
                    <td className="px-3 py-3 text-foreground text-xs whitespace-nowrap">{t.originCode || t.origin} → {t.destinationCode || t.destination}</td>
                    <td className="px-3 py-3"><Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">{t.category}</Badge></td>
                    <td className="px-3 py-3 text-muted-foreground text-xs whitespace-nowrap">{t.travelDate}</td>
                    <td className="px-3 py-3 text-muted-foreground text-xs">{t.departureTime || "—"}</td>
                    <td className="px-3 py-3 text-muted-foreground text-xs">{t.arrivalTime || "—"}</td>
                    <td className="px-3 py-3 text-muted-foreground text-xs whitespace-nowrap">{t.returnDate || "—"}</td>
                    <td className="px-3 py-3 text-muted-foreground text-xs">{t.returnTime || "—"}</td>
                    <td className="px-3 py-3 text-muted-foreground text-xs">{t.baggage || "—"}</td>
                    <td className="px-3 py-3 text-foreground whitespace-nowrap">{t.seatsAvailable}/{t.totalSeats || t.seatsAvailable}</td>
                    <td className="px-3 py-3 font-semibold text-primary whitespace-nowrap">PKR {t.price.toLocaleString()}</td>
                    <td className="px-3 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[t.status]}`}>{t.status}</span></td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(t)} className="h-7 w-7 p-0" data-testid={`button-edit-ticket-${t.id}`}><Edit2 className="w-3 h-3" /></Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(t.id)} className="h-7 w-7 p-0 text-red-400 hover:text-red-300 border-red-500/20" data-testid={`button-delete-ticket-${t.id}`}><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
