import { useState } from "react";
import { motion } from "framer-motion";
import { Plane, Plus, Trash2, Edit2, X, Save } from "lucide-react";
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
  destination: z.string().min(1, "Required"),
  country: z.string().min(1, "Required"),
  category: z.enum(["KSA", "UAE", "Qatar"]),
  travelDate: z.string().min(1, "Required"),
  seatsAvailable: z.number().min(1, "Required"),
  price: z.number().min(1, "Required"),
});
type FormData = z.infer<typeof schema>;

const defaultValues: FormData = { airline: "", flightNumber: "", origin: "", destination: "", country: "Saudi Arabia", category: "KSA", travelDate: "", seatsAvailable: 30, price: 50000 };

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

  const onSubmit = (data: FormData) => {
    const action = editingId
      ? updateTicket.mutate({ id: editingId, data } as any, {
          onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListGroupTicketsQueryKey({}) }); setShowForm(false); setEditingId(null); reset(); toast({ title: "Ticket updated" }); },
          onError: () => toast({ title: "Update failed", variant: "destructive" }),
        })
      : createTicket.mutate({ data } as any, {
          onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListGroupTicketsQueryKey({}) }); setShowForm(false); reset(); toast({ title: "Ticket created" }); },
          onError: () => toast({ title: "Create failed", variant: "destructive" }),
        });
  };

  const handleEdit = (t: any) => {
    setEditingId(t.id);
    reset({ airline: t.airline, flightNumber: t.flightNumber || "", origin: t.origin, destination: t.destination, country: t.country, category: t.category, travelDate: t.travelDate, seatsAvailable: t.seatsAvailable, price: t.price });
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this ticket?")) return;
    deleteTicket.mutate({ id }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListGroupTicketsQueryKey({}) }); toast({ title: "Ticket deleted" }); },
    });
  };

  const statusColors: Record<string, string> = { active: "bg-green-500/10 text-green-400 border-green-500/20", inactive: "bg-gray-500/10 text-gray-400 border-gray-500/20" };

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
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl p-5" data-testid="form-add-ticket">
          <h3 className="font-semibold text-foreground mb-4">{editingId ? "Edit Ticket" : "New Group Ticket"}</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Airline *</label>
              <Input {...register("airline")} placeholder="PIA, Saudia..." className="h-9" data-testid="input-airline" />
              {errors.airline && <p className="text-red-400 text-xs">{errors.airline.message}</p>}
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Flight No.</label>
              <Input {...register("flightNumber")} placeholder="PK-526" className="h-9" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Origin *</label>
              <Input {...register("origin")} placeholder="Lahore" className="h-9" data-testid="input-origin" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Destination *</label>
              <Input {...register("destination")} placeholder="Jeddah" className="h-9" data-testid="input-destination" />
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
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Travel Date *</label>
              <Input {...register("travelDate")} type="date" className="h-9" data-testid="input-travel-date" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Seats *</label>
              <Input {...register("seatsAvailable", { valueAsNumber: true })} type="number" className="h-9" data-testid="input-seats" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Price (PKR) *</label>
              <Input {...register("price", { valueAsNumber: true })} type="number" className="h-9" data-testid="input-price" />
            </div>
            <div className="col-span-2 md:col-span-4 flex gap-2">
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
                {["Airline", "Route", "Category", "Date", "Seats", "Price", "Status", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-border">
                {tickets.map(t => (
                  <tr key={t.id} className="hover:bg-muted/30" data-testid={`admin-ticket-row-${t.id}`}>
                    <td className="px-4 py-3 font-medium text-foreground">{t.airline}</td>
                    <td className="px-4 py-3 text-foreground text-xs">{t.origin} → {t.destination}</td>
                    <td className="px-4 py-3"><Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">{t.category}</Badge></td>
                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{t.travelDate}</td>
                    <td className="px-4 py-3 text-foreground">{t.seatsAvailable}</td>
                    <td className="px-4 py-3 font-semibold text-primary whitespace-nowrap">PKR {t.price.toLocaleString()}</td>
                    <td className="px-4 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[t.status]}`}>{t.status}</span></td>
                    <td className="px-4 py-3">
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
