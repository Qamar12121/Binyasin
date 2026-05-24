import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Plus, Trash2, Edit2, Save, Upload, FileText, Image, Sparkles, X, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
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

function ImportModal({ onClose, onImported }: { onClose: () => void; onImported: () => void }) {
  const [tab, setTab] = useState<"text" | "image">("text");
  const [textInput, setTextInput] = useState("");
  const [imageBase64, setImageBase64] = useState("");
  const [imageMime, setImageMime] = useState("image/jpeg");
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [extracted, setExtracted] = useState<any[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [importing, setImporting] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const createPkg = useCreateUmrahPackage();
  const queryClient = useQueryClient();

  const handleImageUpload = (file: File) => {
    setImageMime(file.type || "image/jpeg");
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      setImageBase64(result.split(",")[1]);
    };
    reader.readAsDataURL(file);
  };

  const handleExtract = async () => {
    setLoading(true);
    setError("");
    setExtracted([]);
    setSelected(new Set());
    try {
      const token = localStorage.getItem("auth_token");
      const body = tab === "text"
        ? { type: "text", content: textInput }
        : { type: "image", base64: imageBase64, mimeType: imageMime };

      const res = await fetch("/api/packages/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Extraction failed");
      const pkgs: any[] = data.packages || [];
      setExtracted(pkgs);
      setSelected(new Set(pkgs.map((_, i) => i)));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    setImporting(true);
    const toImport = extracted.filter((_, i) => selected.has(i));
    let successCount = 0;
    for (const pkg of toImport) {
      try {
        const payload = {
          name: pkg.name || "Umrah Package",
          tier: ["economy", "vip", "luxury"].includes(pkg.tier) ? pkg.tier : "economy",
          description: pkg.description || pkg.name || "Umrah Package",
          hotel: pkg.hotel || pkg.makkahHotel || "Hotel",
          makkahHotel: pkg.makkahHotel || "",
          madinahHotel: pkg.madinahHotel || "",
          makkahNights: pkg.makkahNights || undefined,
          madinahNights: pkg.madinahNights || undefined,
          makkahHotelDistance: pkg.makkahHotelDistance || "",
          madinahHotelDistance: pkg.madinahHotelDistance || "",
          hotelStars: pkg.hotelStars || 3,
          transport: pkg.transport || "JED-MAK-MAD-MAK-JED",
          duration: pkg.duration || 21,
          visaIncluded: pkg.visaIncluded !== false,
          price: pkg.price || 0,
          priceShared: pkg.priceShared || undefined,
          priceDouble: pkg.priceDouble || undefined,
          priceTriple: pkg.priceTriple || undefined,
          priceQuad: pkg.priceQuad || undefined,
          currency: "PKR",
          amenities: Array.isArray(pkg.amenities) ? pkg.amenities : [],
          seatsAvailable: pkg.seatsAvailable || undefined,
          originCity: pkg.originCity || "",
          originCode: pkg.originCode || "",
          destinationCode: pkg.destinationCode || "JED",
          flightNumber: pkg.flightNumber || "",
          returnFlightNumber: pkg.returnFlightNumber || "",
          travelDate: pkg.travelDate || "",
          returnDate: pkg.returnDate || "",
          departureTime: pkg.departureTime || "",
          arrivalTime: pkg.arrivalTime || "",
          returnTime: pkg.returnTime || "",
          returnArrivalTime: pkg.returnArrivalTime || "",
          baggage: pkg.baggage || "",
          mealIncluded: pkg.mealIncluded !== false,
        };
        await new Promise<void>((resolve, reject) => {
          createPkg.mutate({ data: payload } as any, {
            onSuccess: () => { successCount++; resolve(); },
            onError: (e: any) => reject(e),
          });
        });
      } catch {}
    }
    await queryClient.invalidateQueries({ queryKey: getListUmrahPackagesQueryKey() });
    setImporting(false);
    toast({ title: `${successCount} package${successCount !== 1 ? "s" : ""} imported successfully!` });
    onImported();
    onClose();
  };

  const canExtract = tab === "text" ? textInput.trim().length > 10 : !!imageBase64;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">AI Package Import</h2>
              <p className="text-xs text-muted-foreground">Paste text or upload a photo — AI fills all fields automatically</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {/* Tabs */}
          {extracted.length === 0 && (
            <>
              <div className="flex gap-2 p-1 bg-muted/50 rounded-xl">
                <button onClick={() => setTab("text")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === "text" ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"}`}>
                  <FileText className="w-4 h-4" /> Paste Text
                </button>
                <button onClick={() => setTab("image")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === "image" ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"}`}>
                  <Image className="w-4 h-4" /> Upload Photo
                </button>
              </div>

              {tab === "text" && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Paste brochure text, WhatsApp message, or any package details:</label>
                  <Textarea
                    value={textInput}
                    onChange={e => setTextInput(e.target.value)}
                    placeholder={`Example:\nECONOMY UMRAH PACKAGE 21 DAYS\nMakkah Hotel: Haris/Zaid Al Bait (800m from Haram)\nMadinah Hotel: Shaza Munwra (900m from Haram)\nFlight: PIA PA-472 | 15-Jan-2026 | LHE → JED\nShared: 266,702 | Double: 321,680 | Triple: 289,597\nVisa Included | Meals Included | 23 KG Baggage`}
                    rows={8}
                    className="text-sm font-mono resize-none focus:border-primary/50 transition-colors"
                  />
                </div>
              )}

              {tab === "image" && (
                <div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden"
                    onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
                  {imagePreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-border">
                      <img src={imagePreview} alt="Package brochure" className="w-full max-h-64 object-contain bg-black/20" />
                      <button onClick={() => { setImagePreview(""); setImageBase64(""); }}
                        className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-red-500/80 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => fileRef.current?.click()}
                      className="w-full border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-10 text-center transition-all group"
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleImageUpload(f); }}>
                      <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary mx-auto mb-3 transition-colors" />
                      <p className="text-sm font-medium text-foreground">Drop image here or click to browse</p>
                      <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP — brochure photo or screenshot</p>
                    </button>
                  )}
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <Button onClick={handleExtract} disabled={!canExtract || loading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all">
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> AI is reading the brochure...</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" /> Extract Packages with AI</>
                )}
              </Button>
            </>
          )}

          {/* Extracted Results */}
          {extracted.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <span className="font-semibold text-foreground">{extracted.length} package{extracted.length !== 1 ? "s" : ""} found</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setSelected(new Set(extracted.map((_, i) => i)))}
                    className="text-xs text-primary hover:text-primary/80 transition-colors">Select All</button>
                  <span className="text-muted-foreground text-xs">·</span>
                  <button onClick={() => setSelected(new Set())}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors">None</button>
                  <span className="text-muted-foreground text-xs">·</span>
                  <button onClick={() => { setExtracted([]); setSelected(new Set()); }}
                    className="text-xs text-muted-foreground hover:text-red-400 transition-colors">Re-extract</button>
                </div>
              </div>

              {extracted.map((pkg, i) => (
                <div key={i}
                  className={`rounded-xl border transition-all ${selected.has(i) ? "border-primary/40 bg-primary/5" : "border-border bg-card/50 opacity-60"}`}>
                  <div className="flex items-start gap-3 p-3 cursor-pointer" onClick={() => {
                    const next = new Set(selected);
                    next.has(i) ? next.delete(i) : next.add(i);
                    setSelected(next);
                  }}>
                    <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${selected.has(i) ? "bg-primary border-primary" : "border-border"}`}>
                      {selected.has(i) && <CheckCircle2 className="w-3 h-3 text-primary-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground text-sm truncate">{pkg.name || "Unnamed Package"}</span>
                        <Badge variant="outline" className={`text-xs ${tierColors[pkg.tier] || tierColors.economy}`}>{(pkg.tier || "economy").toUpperCase()}</Badge>
                        {pkg.duration && <span className="text-xs text-muted-foreground">{pkg.duration} days</span>}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-xs text-muted-foreground">
                        {pkg.makkahHotel && <span>🕋 {pkg.makkahHotel}</span>}
                        {pkg.madinahHotel && <span>🕌 {pkg.madinahHotel}</span>}
                        {pkg.price > 0 && <span className="text-primary font-medium">PKR {Number(pkg.price).toLocaleString()}</span>}
                        {pkg.flightNumber && <span>✈ {pkg.flightNumber}</span>}
                      </div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); setExpandedIdx(expandedIdx === i ? null : i); }}
                      className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
                      {expandedIdx === i ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  <AnimatePresence>
                    {expandedIdx === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="px-3 pb-3 border-t border-border/50 pt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                          {[
                            ["Description", pkg.description],
                            ["Makkah Hotel", pkg.makkahHotel && `${pkg.makkahHotel}${pkg.makkahNights ? ` (${pkg.makkahNights}N)` : ""}${pkg.makkahHotelDistance ? ` — ${pkg.makkahHotelDistance}` : ""}`],
                            ["Madinah Hotel", pkg.madinahHotel && `${pkg.madinahHotel}${pkg.madinahNights ? ` (${pkg.madinahNights}N)` : ""}${pkg.madinahHotelDistance ? ` — ${pkg.madinahHotelDistance}` : ""}`],
                            ["Flight", pkg.flightNumber],
                            ["Return Flight", pkg.returnFlightNumber],
                            ["Travel Date", pkg.travelDate],
                            ["Return Date", pkg.returnDate],
                            ["Origin", pkg.originCity ? `${pkg.originCity} (${pkg.originCode})` : pkg.originCode],
                            ["Baggage", pkg.baggage],
                            ["Stars", pkg.hotelStars ? `${pkg.hotelStars}★` : ""],
                            ["Visa", pkg.visaIncluded ? "✅ Included" : "❌ Not included"],
                            ["Meal", pkg.mealIncluded ? "✅ Included" : "—"],
                            ["Shared Price", pkg.priceShared ? `PKR ${Number(pkg.priceShared).toLocaleString()}` : ""],
                            ["Double Price", pkg.priceDouble ? `PKR ${Number(pkg.priceDouble).toLocaleString()}` : ""],
                            ["Triple Price", pkg.priceTriple ? `PKR ${Number(pkg.priceTriple).toLocaleString()}` : ""],
                            ["Quad Price", pkg.priceQuad ? `PKR ${Number(pkg.priceQuad).toLocaleString()}` : ""],
                            ["Seats", pkg.seatsAvailable ? String(pkg.seatsAvailable) : ""],
                            ["Amenities", Array.isArray(pkg.amenities) ? pkg.amenities.join(", ") : pkg.amenities],
                          ].filter(([, v]) => v).map(([label, value], j) => (
                            <div key={j} className={label === "Description" || label === "Amenities" ? "col-span-2" : ""}>
                              <span className="text-muted-foreground">{label}: </span>
                              <span className="text-foreground">{value}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}
        </div>

        {extracted.length > 0 && (
          <div className="p-5 border-t border-border flex-shrink-0 flex gap-3">
            <Button onClick={handleImport} disabled={selected.size === 0 || importing}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all">
              {importing ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Importing...</>
              ) : (
                <><CheckCircle2 className="w-4 h-4 mr-2" /> Import {selected.size} Package{selected.size !== 1 ? "s" : ""}</>
              )}
            </Button>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function AdminPackagesPage() {
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
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
      {showImport && <ImportModal onClose={() => setShowImport(false)} onImported={() => queryClient.invalidateQueries(qKey)} />}

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Umrah Packages</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage Economy, VIP, and Luxury packages</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowImport(true)}
            className="border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 transition-all"
            data-testid="button-import-packages">
            <Sparkles className="w-4 h-4 mr-2" /> AI Import
          </Button>
          <Button onClick={() => { setShowForm(!showForm); setEditingId(null); reset(); }} className="bg-primary text-primary-foreground" data-testid="button-add-package">
            <Plus className="w-4 h-4 mr-2" />{showForm ? "Cancel" : "Add Package"}
          </Button>
        </div>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">{editingId ? "Edit Package" : "New Package"}</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

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

            <p className="text-xs font-semibold text-primary uppercase tracking-wide mt-1">Pricing</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div><Label>Base Price (PKR) *</Label><Input {...register("price", { valueAsNumber: true })} type="number" className="h-9" data-testid="input-package-price" /></div>
              <div><Label>Shared Price</Label><Input {...register("priceShared", { valueAsNumber: true })} type="number" placeholder="266702" className="h-9" /></div>
              <div><Label>Double Price</Label><Input {...register("priceDouble", { valueAsNumber: true })} type="number" placeholder="321680" className="h-9" /></div>
              <div><Label>Triple Price</Label><Input {...register("priceTriple", { valueAsNumber: true })} type="number" placeholder="289597" className="h-9" /></div>
              <div><Label>Quad Price</Label><Input {...register("priceQuad", { valueAsNumber: true })} type="number" placeholder="273555" className="h-9" /></div>
            </div>

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
          ? (
            <div className="text-center py-16 bg-card border border-border rounded-xl">
              <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-foreground font-medium mb-1">No packages yet</p>
              <p className="text-muted-foreground text-sm mb-4">Add manually or use AI Import to auto-fill from a brochure</p>
              <Button variant="outline" onClick={() => setShowImport(true)} className="border-primary/30 text-primary hover:bg-primary/10">
                <Sparkles className="w-4 h-4 mr-2" /> Try AI Import
              </Button>
            </div>
          )
          : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(packages as any[]).map((p: any, i: number) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-card border border-border rounded-xl p-5 hover:border-border/80 hover:shadow-md transition-all" data-testid={`admin-pkg-${p.id}`}>
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
