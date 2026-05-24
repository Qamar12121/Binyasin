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
  hotelStars: z.number().min(1).max(5),
  transport: z.string().min(1, "Required"),
  duration: z.number().min(1),
  visaIncluded: z.boolean(),
  price: z.number().min(1),
  amenities: z.string(),
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
    defaultValues: { name: "", tier: "economy", description: "", hotel: "", hotelStars: 3, transport: "Private Bus", duration: 14, visaIncluded: true, price: 150000, amenities: "" },
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
    reset({ name: p.name, tier: p.tier, description: p.description, hotel: p.hotel, hotelStars: p.hotelStars, transport: p.transport, duration: p.duration, visaIncluded: p.visaIncluded, price: p.price, amenities: p.amenities?.join(", ") || "" });
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this package?")) return;
    deletePkg.mutate({ id }, { onSuccess: () => { queryClient.invalidateQueries(qKey); toast({ title: "Package deleted" }); } });
  };

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
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground mb-1 block">Package Name *</label>
              <Input {...register("name")} placeholder="e.g. Economy Umrah 14 Days" className="h-9" data-testid="input-package-name" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Tier *</label>
              <Select defaultValue="economy" onValueChange={v => setValue("tier", v as any)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="economy">Economy</SelectItem><SelectItem value="vip">VIP</SelectItem><SelectItem value="luxury">Luxury</SelectItem></SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Duration (days) *</label>
              <Input {...register("duration", { valueAsNumber: true })} type="number" className="h-9" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground mb-1 block">Hotel Name *</label>
              <Input {...register("hotel")} placeholder="Hilton Makkah" className="h-9" data-testid="input-hotel" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Hotel Stars *</label>
              <Input {...register("hotelStars", { valueAsNumber: true })} type="number" min={1} max={5} className="h-9" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Price (PKR) *</label>
              <Input {...register("price", { valueAsNumber: true })} type="number" className="h-9" data-testid="input-package-price" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground mb-1 block">Transport</label>
              <Input {...register("transport")} placeholder="Private Bus, AC Van..." className="h-9" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground mb-1 block">Amenities (comma separated)</label>
              <Input {...register("amenities")} placeholder="Ziyarat, Meals, Guided Tour..." className="h-9" />
            </div>
            <div className="col-span-4">
              <label className="text-xs text-muted-foreground mb-1 block">Description *</label>
              <Textarea {...register("description")} placeholder="Package description..." rows={2} />
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <input {...register("visaIncluded")} type="checkbox" id="visaIncluded" className="w-4 h-4" />
              <label htmlFor="visaIncluded" className="text-sm text-foreground">Visa Included</label>
            </div>
            <div className="col-span-4 flex gap-2">
              <Button type="submit" className="bg-primary text-primary-foreground" disabled={createPkg.isPending} data-testid="button-save-package">
                <Save className="w-4 h-4 mr-2" />{editingId ? "Update" : "Create Package"}
              </Button>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); reset(); }}>Cancel</Button>
            </div>
          </form>
        </motion.div>
      )}

      {isLoading ? <div className="grid grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="h-48 bg-card border border-border rounded-xl animate-pulse" />)}</div>
      : !packages?.length ? <div className="text-center py-12 bg-card border border-border rounded-xl"><Package className="w-8 h-8 text-muted-foreground mx-auto mb-2" /><p className="text-muted-foreground text-sm">No packages yet.</p></div>
      : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map((p, i) => (
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
                <div className="flex justify-between"><span className="text-muted-foreground">Hotel:</span> <span className="text-foreground">{p.hotel} ({"⭐".repeat(p.hotelStars)})</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Duration:</span> <span className="text-foreground">{p.duration} days</span></div>
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
      )}
    </div>
  );
}
