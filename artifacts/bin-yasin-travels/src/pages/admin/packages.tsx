import { useState } from "react";
import { motion } from "framer-motion";
import { Package, Plus, Trash2, Edit2, Save } from "lucide-react";
import { useListUmrahPackages, useCreateUmrahPackage, useUpdateUmrahPackage, useDeleteUmrahPackage, getListUmrahPackagesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  name: z.string().min(1, "Required"),
  tier: z.enum(["economy", "vip", "luxury"]),
  description: z.string().min(1, "Required"),
  hotel: z.string().min(1, "Required"),
  makkahHotel: z.string().optional(),
  madinahHotel: z.string().optional(),
  makkahNights: z.number().optional(),
  madinahNights: z.number().optional(),
  makkahHotelDistance: z.string().optional(),
  madinahHotelDistance: z.string().optional(),
  hotelStars: z.number().min(1).max(5),
  transport: z.string().min(1, "Required"),
  duration: z.number().min(1),
  visaIncluded: z.boolean(),
  price: z.number().min(1),
  priceShared: z.number().optional(),
  priceDouble: z.number().optional(),
  priceTriple: z.number().optional(),
  priceQuad: z.number().optional(),
  amenities: z.string(),
  seatsAvailable: z.number().optional(),
  originCity: z.string().optional(),
  originCode: z.string().optional(),
  destinationCode: z.string().optional(),
  flightNumber: z.string().optional(),
  returnFlightNumber: z.string().optional(),
  travelDate: z.string().optional(),
  departureTime: z.string().optional(),
  arrivalTime: z.string().optional(),
  returnDate: z.string().optional(),
  returnTime: z.string().optional(),
  returnArrivalTime: z.string().optional(),
  baggage: z.string().optional(),
  mealIncluded: z.boolean().optional(),
});
type FormData = z.infer<typeof schema>;

const tierColors: Record<string, string> = { economy: "bg-blue-500/10 text-blue-400 border-blue-500/20", vip: "bg-purple-500/10 text-purple-400 border-purple-500/20", luxury: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" };
const statusColors: Record<string, string> = { active: "bg-green-500/10 text-green-400 border-green-500/20", inactive: "bg-gray-500/10 text-gray-400 border-gray-500/20" };

export default function AdminPackagesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { data: packages, isLoading } = useListUmrahPackages();
  const createPkg = useCreateUmrahPackage();
  const updatePkg = useUpdateUmrahPackage();
  const deletePkg = useDeleteUmrahPackage();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", tier: "economy", description: "", hotel: "", makkahHotel: "", madinahHotel: "", makkahNights: undefined, madinahNights: undefined, makkahHotelDistance: "", madinahHotelDistance: "", hotelStars: 3, transport: "JED-MAK-MAD-MAK-JED", duration: 21, visaIncluded: true, price: 150000, priceShared: undefined, priceDouble: undefined, priceTriple: undefined, priceQuad: undefined, amenities: "", seatsAvailable: undefined, originCity: "", originCode: "", destinationCode: "JED", flightNumber: "", returnFlightNumber: "", travelDate: "", departureTime: "", arrivalTime: "", returnDate: "", returnTime: "", returnArrivalTime: "", baggage: "20 KG", mealIncluded: true },
  });

  const qKey = { queryKey: getListUmrahPackagesQueryKey() };

  const onSubmit = (data: FormData) => {
    const payload = { ...data, amenities: data.amenities ? data.amenities.split(",").map(s => s.trim()).filter(Boolean) : [] };
    if (editingId) {
      updatePkg.mutate({ id: editingId, data: payload } as any, {
        onSuccess: () => { queryClient.invalidateQueries(qKey); setShowForm(false); setEditingId(null); reset(); toast({ title: "Package updated" }); },
      });
    } else {
      createPkg.mutate({ data: payload } as any, {
        onSuccess: () => { queryClient.invalidateQueries(qKey); setShowForm(false); reset(); toast({ title: "Package created" }); },
      });
    }
  };

  const handleEdit = (p: any) => {
    setEditingId(p.id);
    reset({ name: p.name, tier: p.tier, description: p.description, hotel: p.hotel, makkahHotel: p.makkahHotel || "", madinahHotel: p.madinahHotel || "", makkahNights: p.makkahNights || undefined, madinahNights: p.madinahNights || undefined, makkahHotelDistance: p.makkahHotelDistance || "", madinahHotelDistance: p.madinahHotelDistance || "", hotelStars: p.hotelStars, transport: p.transport, duration: p.duration, visaIncluded: p.visaIncluded, price: p.price, priceShared: p.priceShared || undefined, priceDouble: p.priceDouble || undefined, priceTriple: p.priceTriple || undefined, priceQuad: p.priceQuad || undefined, amenities: p.amenities?.join(", ") || "", seatsAvailable: p.seatsAvailable || undefined, originCity: p.originCity || "", originCode: p.originCode || "", destinationCode: p.destinationCode || "JED", flightNumber: p.flightNumber || "", returnFlightNumber: p.returnFlightNumber || "", travelDate: p.travelDate || "", departureTime: p.departureTime || "", arrivalTime: p.arrivalTime || "", returnDate: p.returnDate || "", returnTime: p.returnTime || "", returnArrivalTime: p.returnArrivalTime || "", baggage: p.baggage || "20 KG", mealIncluded: p.mealIncluded !== false });
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this package?")) return;
    deletePkg.mutate({ id }, { onSuccess: () => { queryClient.invalidateQueries(qKey); toast({ title: "Package deleted" }); } });
  };

  const Label = ({ children }: { children: string }) => <label className="text-xs text-muted-foreground mb-1 block">{children}</label>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-serif font-bold text-foreground">Umrah Packages</h1><p className="text-muted-foreground text-sm mt-1">Manage Economy, VIP, and Luxury packages</p></div>
        <Button onClick={() => { setShowForm(!showForm); setEditingId(null); reset(); }} className="bg-primary text-primary-foreground" data-testid="button-add-package">
          <Plus className="w-4 h-4 mr-2" />{showForm ? "Cancel" : "Add Package"}
        </Button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">{editingId ? "Edit Package" : "New Package"}</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Basic */}
            <p className="text-xs font-semibold text-primary uppercase tracking-wide">Package Info</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="col-span-2"><Label>Package Name *</Label><Input {...register("name")} placeholder="Economy Umrah 21 Days" className="h-9" data-testid="input-package-name" /></div>
              <div><Label>Tier *</Label>
                <Select defaultValue="economy" onValueChange={v => setValue("tier", v as any)}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="economy">Economy</SelectItem><SelectItem value="vip">VIP</SelectItem><SelectItem value="luxury">Luxury</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>Duration (days) *</Label><Input {...register("duration", { valueAsNumber: true })} type="number" className="h-9" /></div>
              <div><Label>Seats Available</Label><Input {...register("seatsAvailable", { valueAsNumber: true })} type="number" className="h-9" placeholder="10" /></div>
              <div><Label>Hotel Stars *</Label><Input {...register("hotelStars", { valueAsNumber: true })} type="number" min={1} max={5} className="h-9" /></div>
              <div className="col-span-2"><Label>Transport Route</Label><Input {...register("transport")} placeholder="JED-MAK-MAD-MAK-JED" className="h-9" /></div>
            </div>

            {/* Hotels */}
            <p className="text-xs font-semibold text-primary uppercase tracking-wide mt-1">Hotel Details</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="col-span-2"><Label>Makkah Hotel *</Label><Input {...register("makkahHotel")} placeholder="HARIS / ZAID AL BAIT OR SIMILAR" className="h-9" /></div>
              <div><Label>Makkah Nights</Label><Input {...register("makkahNights", { valueAsNumber: true })} type="number" placeholder="6" className="h-9" /></div>
              <div><Label>Distance from Haram</Label><Input {...register("makkahHotelDistance")} placeholder="800m from Haram" className="h-9" /></div>
              <div className="col-span-2"><Label>Madinah Hotel *</Label><Input {...register("madinahHotel")} placeholder="SHAZA MUNWRA OR SIMILAR" className="h-9" /></div>
              <div><Label>Madinah Nights</Label><Input {...register("madinahNights", { valueAsNumber: true })} type="number" placeholder="8" className="h-9" /></div>
              <div><Label>Distance from Haram</Label><Input {...register("madinahHotelDistance")} placeholder="800m from Haram" className="h-9" /></div>
              <div className="col-span-2"><Label>Hotel (General / Fallback) *</Label><Input {...register("hotel")} placeholder="e.g. 5-Star Makkah Hotel" className="h-9" data-testid="input-hotel" /></div>
            </div>

            {/* Flights */}
            <p className="text-xs font-semibold text-primary uppercase tracking-wide mt-1">Flight Details</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div><Label>Origin City</Label><Input {...register("originCity")} placeholder="Lahore" className="h-9" /></div>
              <div><Label>Origin Code</Label><Input {...register("originCode")} placeholder="LHE" className="h-9" /></div>
              <div><Label>Destination Code</Label><Input {...register("destinationCode")} placeholder="JED" className="h-9" /></div>
              <div><Label>Outbound Flight No.</Label><Input {...register("flightNumber")} placeholder="PA 472" className="h-9" /></div>
              <div><Label>Travel Date</Label><Input {...register("travelDate")} type="date" className="h-9" /></div>
              <div><Label>Dep Time</Label><Input {...register("departureTime")} placeholder="23:55" className="h-9" /></div>
              <div><Label>Arrival Time</Label><Input {...register("arrivalTime")} placeholder="03:15" className="h-9" /></div>
              <div><Label>Baggage</Label><Input {...register("baggage")} placeholder="20 KG" className="h-9" /></div>
              <div><Label>Return Flight No.</Label><Input {...register("returnFlightNumber")} placeholder="PA 471" className="h-9" /></div>
              <div><Label>Return Date</Label><Input {...register("returnDate")} type="date" className="h-9" /></div>
              <div><Label>Return Dep Time</Label><Input {...register("returnTime")} placeholder="04:30" className="h-9" /></div>
              <div><Label>Return Arr Time</Label><Input {...register("returnArrivalTime")} placeholder="12:00" className="h-9" /></div>
            </div>

            {/* Pricing */}
            <p className="text-xs font-semibold text-primary uppercase tracking-wide mt-1">Pricing</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div><Label>Base Price (PKR) *</Label><Input {...register("price", { valueAsNumber: true })} type="number" className="h-9" data-testid="input-package-price" /></div>
              <div><Label>Shared Price</Label><Input {...register("priceShared", { valueAsNumber: true })} type="number" placeholder="266702" className="h-9" /></div>
              <div><Label>Double Price</Label><Input {...register("priceDouble", { valueAsNumber: true })} type="number" placeholder="321680" className="h-9" /></div>
              <div><Label>Triple Price</Label><Input {...register("priceTriple", { valueAsNumber: true })} type="number" placeholder="289597" className="h-9" /></div>
              <div><Label>Quad Price</Label><Input {...register("priceQuad", { valueAsNumber: true })} type="number" placeholder="273555" className="h-9" /></div>
            </div>

            {/* Other */}
            <p className="text-xs font-semibold text-primary uppercase tracking-wide mt-1">Other</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="col-span-2"><Label>Amenities (comma separated)</Label><Input {...register("amenities")} placeholder="Ziyarat, Guided Tour, Airport Transfer..." className="h-9" /></div>
              <div className="col-span-4"><Label>Description *</Label><Textarea {...register("description")} placeholder="Package description..." rows={2} /></div>
              <div className="flex items-center gap-2">
                <input {...register("visaIncluded")} type="checkbox" id="visaIncluded" className="w-4 h-4" />
                <label htmlFor="visaIncluded" className="text-sm text-foreground">Visa Included</label>
              </div>
              <div className="flex items-center gap-2">
                <input {...register("mealIncluded")} type="checkbox" id="pkgMeal" className="w-4 h-4" defaultChecked />
                <label htmlFor="pkgMeal" className="text-sm text-foreground">Meal Included</label>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button type="submit" className="bg-primary text-primary-foreground" disabled={createPkg.isPending} data-testid="button-save-package">
                <Save className="w-4 h-4 mr-2" />{editingId ? "Update" : "Create Package"}
              </Button>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); reset(); }}>Cancel</Button>
            </div>
          </form>
        </motion.div>
      )}

      {isLoading
        ? <div className="grid grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="h-48 bg-card border border-border rounded-xl animate-pulse" />)}</div>
        : !packages?.length
          ? <div className="text-center py-12 bg-card border border-border rounded-xl"><Package className="w-8 h-8 text-muted-foreground mx-auto mb-2" /><p className="text-muted-foreground text-sm">No packages yet.</p></div>
          : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {packages.map((p: any, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-card border border-border rounded-xl p-5" data-testid={`admin-pkg-${p.id}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <Badge variant="outline" className={`text-xs mb-1.5 ${tierColors[p.tier]}`}>{p.tier.toUpperCase()}</Badge>
                      <h3 className="font-semibold text-foreground text-sm">{p.name}</h3>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[p.status]}`}>{p.status}</span>
                  </div>
                  <p className="text-muted-foreground text-xs mb-3 line-clamp-2">{p.description}</p>
                  <div className="space-y-1 text-xs mb-3">
                    {p.makkahHotel && <div className="flex justify-between"><span className="text-muted-foreground">🏨 Makkah:</span> <span className="text-foreground truncate ml-1">{p.makkahHotel}</span></div>}
                    {p.madinahHotel && <div className="flex justify-between"><span className="text-muted-foreground">🕌 Madinah:</span> <span className="text-foreground truncate ml-1">{p.madinahHotel}</span></div>}
                    {p.flightNumber && <div className="flex justify-between"><span className="text-muted-foreground">✈ Flight:</span> <span className="text-foreground">{p.flightNumber}</span></div>}
                    <div className="flex justify-between"><span className="text-muted-foreground">Duration:</span> <span className="text-foreground">{p.duration} days</span></div>
                    {p.seatsAvailable && <div className="flex justify-between"><span className="text-muted-foreground">Seats:</span> <span className="text-green-400">{p.seatsAvailable}</span></div>}
                    <div className="flex justify-between"><span className="text-muted-foreground">Visa:</span> <span className={p.visaIncluded ? "text-green-400" : "text-red-400"}>{p.visaIncluded ? "Included" : "Not Included"}</span></div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="font-serif text-lg font-bold text-primary">PKR {p.price.toLocaleString()}</div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(p)} className="h-7 w-7 p-0"><Edit2 className="w-3 h-3" /></Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(p.id)} className="h-7 w-7 p-0 text-red-400 border-red-500/20"><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )
      }
    </div>
  );
}
