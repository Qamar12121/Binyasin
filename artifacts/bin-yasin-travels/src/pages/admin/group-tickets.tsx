import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, Plus, Trash2, Edit2, Save, Upload, FileText, Image, Sparkles, X, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";

const AIRLINE_OPTIONS = [
  { name: "PIA (Pakistan Int'l)", logo: "https://www.gstatic.com/flights/airline_logos/70px/PK.png" },
  { name: "Airblue", logo: "https://www.gstatic.com/flights/airline_logos/70px/ED.png" },
  { name: "FlyJinnah", logo: "https://www.gstatic.com/flights/airline_logos/70px/9P.png" },
  { name: "SereneAir", logo: "https://www.gstatic.com/flights/airline_logos/70px/ER.png" },
  { name: "AirSial", logo: "https://www.gstatic.com/flights/airline_logos/70px/PF.png" },
  { name: "Qatar Airways", logo: "https://www.gstatic.com/flights/airline_logos/70px/QR.png" },
  { name: "Emirates", logo: "https://www.gstatic.com/flights/airline_logos/70px/EK.png" },
  { name: "Saudi Airlines", logo: "https://www.gstatic.com/flights/airline_logos/70px/SV.png" },
  { name: "Flydubai", logo: "https://www.gstatic.com/flights/airline_logos/70px/FZ.png" },
  { name: "Air Arabia", logo: "https://www.gstatic.com/flights/airline_logos/70px/G9.png" },
];

const schema = z.object({
  airline: z.string().min(1, "Required"),
  airlineLogo: z.string().optional(),
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

const defaultValues: FormData = { airline: "", airlineLogo: "", flightNumber: "", origin: "", originCode: "", destination: "", destinationCode: "", country: "Saudi Arabia", category: "KSA", travelDate: "", departureTime: "", arrivalTime: "", returnDate: "", returnFlightNumber: "", returnTime: "", returnArrivalTime: "", baggage: "23 KG", mealIncluded: true, seatsAvailable: 30, totalSeats: 30, referenceCode: "", price: 50000 };

// ── Import Modal ──────────────────────────────────────────────────────────────
function ImportTicketsModal({ onClose, onImported }: { onClose: () => void; onImported: () => void }) {
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
  const createTicket = useCreateGroupTicket();
  const queryClient = useQueryClient();

  const handleImageUpload = (file: File) => {
    setImageMime(file.type || "image/jpeg");
    const reader = new FileReader();
    reader.onload = e => {
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

      const res = await fetch("/api/tickets/group/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Extraction failed");
      const tickets: any[] = data.tickets || [];
      setExtracted(tickets);
      setSelected(new Set(tickets.map((_, i) => i)));
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
    for (const t of toImport) {
      const airlineOption = AIRLINE_OPTIONS.find(a =>
        a.name.toLowerCase().includes((t.airline || "").toLowerCase().split(" ")[0].toLowerCase())
      );
      const payload = {
        airline: t.airline || "Unknown",
        airlineLogo: t.airlineLogo || airlineOption?.logo || "",
        flightNumber: t.flightNumber || "",
        origin: t.origin || "Lahore",
        originCode: t.originCode || "",
        destination: t.destination || "Jeddah",
        destinationCode: t.destinationCode || "JED",
        country: t.country || "Saudi Arabia",
        category: ["KSA", "UAE", "Qatar"].includes(t.category) ? t.category : "KSA",
        travelDate: t.travelDate || "",
        departureTime: t.departureTime || "",
        arrivalTime: t.arrivalTime || "",
        returnDate: t.returnDate || "",
        returnFlightNumber: t.returnFlightNumber || "",
        returnTime: t.returnTime || "",
        returnArrivalTime: t.returnArrivalTime || "",
        baggage: t.baggage || "23 KG",
        mealIncluded: t.mealIncluded !== false,
        seatsAvailable: t.seatsAvailable || 30,
        totalSeats: t.totalSeats || t.seatsAvailable || 30,
        referenceCode: t.referenceCode || "",
        price: t.price || 0,
        currency: "PKR",
      };
      try {
        await new Promise<void>((resolve, reject) => {
          createTicket.mutate({ data: payload } as any, {
            onSuccess: () => { successCount++; resolve(); },
            onError: (e: any) => reject(e),
          });
        });
      } catch {}
    }
    await queryClient.invalidateQueries({ queryKey: getListGroupTicketsQueryKey({}) });
    setImporting(false);
    toast({ title: `${successCount} ticket${successCount !== 1 ? "s" : ""} imported successfully!` });
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
              <h2 className="font-semibold text-foreground">AI Ticket Import</h2>
              <p className="text-xs text-muted-foreground">Paste a schedule or upload a photo — AI fills every field automatically</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {extracted.length === 0 && (
            <>
              {/* Tabs */}
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
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">
                    Paste flight schedules, WhatsApp messages, or any ticket details:
                  </label>
                  <Textarea
                    value={textInput}
                    onChange={e => setTextInput(e.target.value)}
                    placeholder={`Example:\nPIA GROUP TICKET\nFlight: PA-472 | LHE → JED\nDate: 15-Jan-2026 | Dep: 23:55 | Arr: 03:15\nReturn: PA-471 | 05-Feb-2026 | Dep: 04:30\nSeats: 35 | Price: PKR 65,000\nBaggage: 23 KG | Meal Included\n\nEmirates EK-612 | KHI → DXB\nDate: 20-Jan-2026 | Dep: 14:00 | Arr: 16:30\nSeats: 20 | Price: PKR 85,000`}
                    rows={9}
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
                      <img src={imagePreview} alt="Ticket schedule" className="w-full max-h-64 object-contain bg-black/20" />
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
                      <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP — screenshot or photo of a flight schedule</p>
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
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> AI is reading the schedule...</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" /> Extract Tickets with AI</>
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
                  <span className="font-semibold text-foreground">{extracted.length} ticket{extracted.length !== 1 ? "s" : ""} found</span>
                </div>
                <div className="flex gap-2 text-xs">
                  <button onClick={() => setSelected(new Set(extracted.map((_, i) => i)))} className="text-primary hover:text-primary/80 transition-colors">Select All</button>
                  <span className="text-muted-foreground">·</span>
                  <button onClick={() => setSelected(new Set())} className="text-muted-foreground hover:text-foreground transition-colors">None</button>
                  <span className="text-muted-foreground">·</span>
                  <button onClick={() => { setExtracted([]); setSelected(new Set()); }} className="text-muted-foreground hover:text-red-400 transition-colors">Re-extract</button>
                </div>
              </div>

              {extracted.map((t, i) => {
                const logoSrc = t.airlineLogo || AIRLINE_OPTIONS.find(a => a.name.toLowerCase().includes((t.airline || "").toLowerCase().split(" ")[0]))?.logo;
                return (
                  <div key={i}
                    className={`rounded-xl border transition-all ${selected.has(i) ? "border-primary/40 bg-primary/5" : "border-border bg-card/50 opacity-60"}`}>
                    <div className="flex items-start gap-3 p-3 cursor-pointer"
                      onClick={() => { const n = new Set(selected); n.has(i) ? n.delete(i) : n.add(i); setSelected(n); }}>
                      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${selected.has(i) ? "bg-primary border-primary" : "border-border"}`}>
                        {selected.has(i) && <CheckCircle2 className="w-3 h-3 text-primary-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {logoSrc && <img src={logoSrc} alt={t.airline} className="w-5 h-5 object-contain" />}
                          <span className="font-semibold text-foreground text-sm">{t.airline || "Unknown Airline"}</span>
                          {t.flightNumber && <span className="text-xs text-muted-foreground font-mono">{t.flightNumber}</span>}
                          {t.category && <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">{t.category}</Badge>}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-xs text-muted-foreground">
                          {(t.originCode || t.origin) && (t.destinationCode || t.destination) && (
                            <span>✈ {t.originCode || t.origin} → {t.destinationCode || t.destination}</span>
                          )}
                          {t.travelDate && <span>📅 {t.travelDate}</span>}
                          {t.departureTime && <span>🕐 {t.departureTime}</span>}
                          {t.seatsAvailable > 0 && <span>💺 {t.seatsAvailable} seats</span>}
                          {t.price > 0 && <span className="text-primary font-medium">PKR {Number(t.price).toLocaleString()}</span>}
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
                              ["Flight No.", t.flightNumber],
                              ["Route", t.origin && t.destination ? `${t.origin} (${t.originCode}) → ${t.destination} (${t.destinationCode})` : ""],
                              ["Travel Date", t.travelDate],
                              ["Departure", t.departureTime],
                              ["Arrival", t.arrivalTime],
                              ["Return Flight", t.returnFlightNumber],
                              ["Return Date", t.returnDate],
                              ["Return Dep", t.returnTime],
                              ["Return Arr", t.returnArrivalTime],
                              ["Baggage", t.baggage],
                              ["Meal", t.mealIncluded ? "✅ Included" : "—"],
                              ["Seats", t.seatsAvailable ? `${t.seatsAvailable}/${t.totalSeats || t.seatsAvailable}` : ""],
                              ["Ref Code", t.referenceCode],
                              ["Country", t.country],
                            ].filter(([, v]) => v).map(([label, value], j) => (
                              <div key={j}>
                                <span className="text-muted-foreground">{label}: </span>
                                <span className="text-foreground">{value}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
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
                <><CheckCircle2 className="w-4 h-4 mr-2" /> Import {selected.size} Ticket{selected.size !== 1 ? "s" : ""}</>
              )}
            </Button>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminGroupTicketsPage() {
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
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
    const airlineOption = AIRLINE_OPTIONS.find(a => a.name === t.airline);
    reset({ airline: t.airline, airlineLogo: t.airlineLogo || airlineOption?.logo || "", flightNumber: t.flightNumber || "", origin: t.origin, originCode: t.originCode || "", destination: t.destination, destinationCode: t.destinationCode || "", country: t.country, category: t.category, travelDate: t.travelDate, departureTime: t.departureTime || "", arrivalTime: t.arrivalTime || "", returnDate: t.returnDate || "", returnFlightNumber: t.returnFlightNumber || "", returnTime: t.returnTime || "", returnArrivalTime: t.returnArrivalTime || "", baggage: t.baggage || "23 KG", mealIncluded: t.mealIncluded !== false, seatsAvailable: t.seatsAvailable, totalSeats: t.totalSeats || t.seatsAvailable, referenceCode: t.referenceCode || "", price: t.price });
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this ticket?")) return;
    deleteTicket.mutate({ id }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: qKey }); toast({ title: "Ticket deleted" }); } });
  };

  const statusColors: Record<string, string> = {
    active: "bg-green-500/10 text-green-400 border-green-500/20",
    soldout: "bg-red-500/10 text-red-400 border-red-500/20",
    cancelled: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  };

  return (
    <div className="space-y-5">
      {showImport && (
        <ImportTicketsModal
          onClose={() => setShowImport(false)}
          onImported={() => queryClient.invalidateQueries({ queryKey: qKey })}
        />
      )}

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Group Tickets</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage all group flight listings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowImport(true)}
            className="border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 transition-all"
            data-testid="button-import-tickets">
            <Sparkles className="w-4 h-4 mr-2" /> AI Import
          </Button>
          <Button onClick={() => { setShowForm(!showForm); setEditingId(null); reset(defaultValues); }}
            className="bg-primary text-primary-foreground" data-testid="button-add-ticket">
            <Plus className="w-4 h-4 mr-2" />{showForm ? "Cancel" : "Add Ticket"}
          </Button>
        </div>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl p-5" data-testid="form-add-ticket">
          <h3 className="font-semibold text-foreground mb-4">{editingId ? "Edit Ticket" : "New Group Ticket"}</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">

            <p className="text-xs font-semibold text-primary uppercase tracking-wide">Basic Info</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Airline *</label>
                <Select onValueChange={v => {
                  const option = AIRLINE_OPTIONS.find(a => a.name === v);
                  setValue("airline", v);
                  setValue("airlineLogo", option?.logo || "");
                }}>
                  <SelectTrigger className="h-9" data-testid="input-airline">
                    <SelectValue placeholder="Select airline..." />
                  </SelectTrigger>
                  <SelectContent>
                    {AIRLINE_OPTIONS.map(a => (
                      <SelectItem key={a.name} value={a.name}>
                        <div className="flex items-center gap-2">
                          <img src={a.logo} alt={a.name} className="w-5 h-5 object-contain" />
                          <span>{a.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <Button type="submit" className="bg-primary text-primary-foreground"
                disabled={createTicket.isPending || updateTicket.isPending} data-testid="button-save-ticket">
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
          <div className="p-12 text-center">
            <Plane className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground font-medium mb-1">No tickets yet</p>
            <p className="text-muted-foreground text-sm mb-4">Add manually or use AI Import to bulk-add from a schedule</p>
            <Button variant="outline" onClick={() => setShowImport(true)} className="border-primary/30 text-primary hover:bg-primary/10">
              <Sparkles className="w-4 h-4 mr-2" /> Try AI Import
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {["Airline", "Ref", "Route", "Cat", "Date", "Dep", "Arr", "Ret Date", "Ret Dep", "Baggage", "Seats", "Price", "Status", ""].map(h => (
                    <th key={h} className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(tickets as any[]).map((t: any) => (
                  <tr key={t.id} className="hover:bg-muted/30 transition-colors" data-testid={`admin-ticket-row-${t.id}`}>
                    <td className="px-3 py-3 font-medium text-foreground whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {(t.airlineLogo || AIRLINE_OPTIONS.find(a => a.name === t.airline)?.logo) && (
                          <img src={t.airlineLogo || AIRLINE_OPTIONS.find(a => a.name === t.airline)?.logo} alt={t.airline} className="w-6 h-6 object-contain rounded" />
                        )}
                        {t.airline}
                      </div>
                    </td>
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
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[t.status]}`}>{t.status}</span>
                    </td>
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
