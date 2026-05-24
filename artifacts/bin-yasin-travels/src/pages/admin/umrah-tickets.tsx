import { useState } from "react";
import { motion } from "framer-motion";
import { Plane, Plus, Trash2, Edit2, Save } from "lucide-react";
import { useListUmrahTickets, useCreateUmrahTicket, useUpdateUmrahTicket, useDeleteUmrahTicket, getListUmrahTicketsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  airline: z.string().min(1, "Required"),
  flightNumber: z.string().optional(),
  origin: z.string().min(1, "Required"),
  travelDate: z.string().min(1, "Required"),
  departureTime: z.string().optional(),
  returnDate: z.string().min(1, "Required"),
  returnFlightNumber: z.string().optional(),
  returnTime: z.string().optional(),
  baggage: z.string().optional(),
  mealIncluded: z.boolean().optional(),
  seatsAvailable: z.number().min(1),
  price: z.number().min(1),
});
type FormData = z.infer<typeof schema>;

const statusColors: Record<string, string> = { active: "bg-green-500/10 text-green-400 border-green-500/20", inactive: "bg-gray-500/10 text-gray-400 border-gray-500/20" };

export default function AdminUmrahTicketsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { data: tickets, isLoading } = useListUmrahTickets();
  const createTicket = useCreateUmrahTicket();
  const updateTicket = useUpdateUmrahTicket();
  const deleteTicket = useDeleteUmrahTicket();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { airline: "", flightNumber: "", origin: "", travelDate: "", departureTime: "", returnDate: "", returnFlightNumber: "", returnTime: "", baggage: "23 KG", mealIncluded: true, seatsAvailable: 30, price: 80000 },
  });

  const onSubmit = (data: FormData) => {
    const qk = { queryKey: getListUmrahTicketsQueryKey() };
    if (editingId) {
      updateTicket.mutate({ id: editingId, data } as any, {
        onSuccess: () => { queryClient.invalidateQueries(qk); setShowForm(false); setEditingId(null); reset(); toast({ title: "Ticket updated" }); },
      });
    } else {
      createTicket.mutate({ data } as any, {
        onSuccess: () => { queryClient.invalidateQueries(qk); setShowForm(false); reset(); toast({ title: "Ticket created" }); },
      });
    }
  };

  const handleEdit = (t: any) => {
    setEditingId(t.id);
    reset({ airline: t.airline, flightNumber: t.flightNumber || "", origin: t.origin, travelDate: t.travelDate, departureTime: t.departureTime || "", returnDate: t.returnDate || "", returnFlightNumber: t.returnFlightNumber || "", returnTime: t.returnTime || "", baggage: t.baggage || "23 KG", mealIncluded: t.mealIncluded !== false, seatsAvailable: t.seatsAvailable, price: t.price });
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this Umrah ticket?")) return;
    deleteTicket.mutate({ id }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListUmrahTicketsQueryKey() }); toast({ title: "Deleted" }); } });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-serif font-bold text-foreground">Umrah Tickets</h1><p className="text-muted-foreground text-sm mt-1">Manage dedicated Umrah flights</p></div>
        <Button onClick={() => { setShowForm(!showForm); setEditingId(null); }} className="bg-primary text-primary-foreground" data-testid="button-add-umrah-ticket">
          <Plus className="w-4 h-4 mr-2" />{showForm ? "Cancel" : "Add Ticket"}
        </Button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">{editingId ? "Edit Umrah Ticket" : "New Umrah Ticket"}</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Airline *</label>
              <Input {...register("airline")} placeholder="PIA, Saudia..." className="h-9" data-testid="input-airline" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Flight No. (Outbound)</label>
              <Input {...register("flightNumber")} placeholder="SV 801" className="h-9" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Origin City *</label>
              <Input {...register("origin")} placeholder="Multan" className="h-9" data-testid="input-origin" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Depart Date *</label>
              <Input {...register("travelDate")} type="date" className="h-9" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Departure Time</label>
              <Input {...register("departureTime")} placeholder="16:35" className="h-9" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Return Flight No.</label>
              <Input {...register("returnFlightNumber")} placeholder="SV 800" className="h-9" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Return Date *</label>
              <Input {...register("returnDate")} type="date" className="h-9" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Return Time</label>
              <Input {...register("returnTime")} placeholder="08:40" className="h-9" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Baggage</label>
              <Input {...register("baggage")} placeholder="23 KG" className="h-9" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Seats *</label>
              <Input {...register("seatsAvailable", { valueAsNumber: true })} type="number" className="h-9" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Price (PKR) *</label>
              <Input {...register("price", { valueAsNumber: true })} type="number" className="h-9" />
            </div>
            <div className="flex items-center gap-2">
              <input {...register("mealIncluded")} type="checkbox" id="umrahMeal" className="w-4 h-4" defaultChecked />
              <label htmlFor="umrahMeal" className="text-sm text-foreground">Meal Included</label>
            </div>
            <div className="col-span-2 md:col-span-4 flex gap-2">
              <Button type="submit" className="bg-primary text-primary-foreground" disabled={createTicket.isPending} data-testid="button-save-umrah-ticket">
                <Save className="w-4 h-4 mr-2" />{editingId ? "Update" : "Create"}
              </Button>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); reset(); }}>Cancel</Button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? <div className="p-6 space-y-2">{[1,2,3].map(i => <div key={i} className="h-12 bg-muted rounded animate-pulse" />)}</div>
        : !tickets?.length ? <div className="p-12 text-center"><Plane className="w-8 h-8 text-muted-foreground mx-auto mb-2" /><p className="text-muted-foreground text-sm">No Umrah tickets yet.</p></div>
        : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/50">
                {["Airline", "Flight No", "Origin", "Depart", "Time", "Return", "Baggage", "Meal", "Seats", "Price", "Status", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-border">
                {tickets.map(t => (
                  <tr key={t.id} className="hover:bg-muted/30" data-testid={`umrah-admin-row-${t.id}`}>
                    <td className="px-4 py-3 font-medium text-foreground">{t.airline}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{t.flightNumber || "—"}</td>
                    <td className="px-4 py-3 text-foreground">{t.origin}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{t.travelDate}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{(t as any).departureTime || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{t.returnDate}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{(t as any).baggage || "—"}</td>
                    <td className="px-4 py-3 text-xs">{(t as any).mealIncluded !== false ? <span className="text-green-400">Yes</span> : <span className="text-red-400">No</span>}</td>
                    <td className="px-4 py-3 text-foreground">{t.seatsAvailable}</td>
                    <td className="px-4 py-3 font-semibold text-primary whitespace-nowrap">PKR {t.price.toLocaleString()}</td>
                    <td className="px-4 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[t.status]}`}>{t.status}</span></td>
                    <td className="px-4 py-3"><div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(t)} className="h-7 w-7 p-0"><Edit2 className="w-3 h-3" /></Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(t.id)} className="h-7 w-7 p-0 text-red-400 border-red-500/20"><Trash2 className="w-3 h-3" /></Button>
                    </div></td>
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
