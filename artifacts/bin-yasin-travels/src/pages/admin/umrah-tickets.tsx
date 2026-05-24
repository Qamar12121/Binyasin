import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, Plus, Trash2, Edit2, Save, Upload, FileText, Image, Sparkles, X, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useListUmrahTickets, useCreateUmrahTicket, useUpdateUmrahTicket, useDeleteUmrahTicket, getListUmrahTicketsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

const statusColors: Record<string, string> = {
  active: "bg-green-500/10 text-green-400 border-green-500/20",
  inactive: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

// ── Import Modal ──────────────────────────────────────────────────────────────
function ImportUmrahTicketsModal({ onClose, onImported }: { onClose: () => void; onImported: () => void }) {
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
  const createTicket = useCreateUmrahTicket();
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

      const res = await fetch("/api/tickets/umrah/extract", {
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
      const payload = {
        airline: t.airline || "Unknown",
        flightNumber: t.flightNumber || "",
        origin: t.origin || "Lahore",
        travelDate: t.travelDate || "",
        departureTime: t.departureTime || "",
        returnDate: t.returnDate || "",
        returnFlightNumber: t.returnFlightNumber || "",
        returnTime: t.returnTime || "",
        baggage: t.baggage || "23 KG",
        mealIncluded: t.mealIncluded !== false,
        seatsAvailable: t.seatsAvailable || 30,
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
    await queryClient.invalidateQueries({ queryKey: getListUmrahTicketsQueryKey() });
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
              <h2 className="font-semibold text-foreground">AI Umrah Ticket Import</h2>
              <p className="text-xs text-muted-foreground">Paste text or upload a photo — AI fills every field automatically</p>
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
                    Paste Umrah flight details, WhatsApp message, or schedule:
                  </label>
                  <Textarea
                    value={textInput}
                    onChange={e => setTextInput(e.target.value)}
                    placeholder={`Example:\nSaudia Umrah Flights\nSV-801 | Multan → Jeddah\nDepart: 15-Jan-2026 | Time: 16:35\nReturn: SV-800 | 05-Feb-2026 | Time: 08:40\nBaggage: 23 KG | Meal: Yes\nSeats: 30 | Price: PKR 85,000\n\nPIA PA-472 | Lahore → Jeddah\nDepart: 20-Jan-2026 | Time: 23:55\nReturn: PA-471 | 10-Feb-2026\nSeats: 40 | Price: PKR 72,000`}
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
                      <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP — screenshot or photo of an Umrah flight schedule</p>
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

              {extracted.map((t, i) => (
                <div key={i}
                  className={`rounded-xl border transition-all ${selected.has(i) ? "border-primary/40 bg-primary/5" : "border-border bg-card/50 opacity-60"}`}>
                  <div className="flex items-start gap-3 p-3 cursor-pointer"
                    onClick={() => { const n = new Set(selected); n.has(i) ? n.delete(i) : n.add(i); setSelected(n); }}>
                    <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${selected.has(i) ? "bg-primary border-primary" : "border-border"}`}>
                      {selected.has(i) && <CheckCircle2 className="w-3 h-3 text-primary-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground text-sm">{t.airline || "Unknown Airline"}</span>
                        {t.flightNumber && <span className="text-xs text-muted-foreground font-mono">{t.flightNumber}</span>}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-xs text-muted-foreground">
                        {t.origin && <span>✈ {t.origin} → Jeddah</span>}
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
                            ["Outbound Flight", t.flightNumber],
                            ["Origin", t.origin],
                            ["Travel Date", t.travelDate],
                            ["Departure Time", t.departureTime],
                            ["Return Flight", t.returnFlightNumber],
                            ["Return Date", t.returnDate],
                            ["Return Time", t.returnTime],
                            ["Baggage", t.baggage],
                            ["Meal", t.mealIncluded ? "✅ Included" : "—"],
                            ["Seats", t.seatsAvailable ? String(t.seatsAvailable) : ""],
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
export default function AdminUmrahTicketsPage() {
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
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

  const qk = { queryKey: getListUmrahTicketsQueryKey() };

  const onSubmit = (data: FormData) => {
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
    deleteTicket.mutate({ id }, { onSuccess: () => { queryClient.invalidateQueries(qk); toast({ title: "Deleted" }); } });
  };

  return (
    <div className="space-y-5">
      {showImport && (
        <ImportUmrahTicketsModal
          onClose={() => setShowImport(false)}
          onImported={() => queryClient.invalidateQueries(qk)}
        />
      )}

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Umrah Tickets</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage dedicated Umrah flights</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowImport(true)}
            className="border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 transition-all"
            data-testid="button-import-umrah-tickets">
            <Sparkles className="w-4 h-4 mr-2" /> AI Import
          </Button>
          <Button onClick={() => { setShowForm(!showForm); setEditingId(null); reset(); }}
            className="bg-primary text-primary-foreground" data-testid="button-add-umrah-ticket">
            <Plus className="w-4 h-4 mr-2" />{showForm ? "Cancel" : "Add Ticket"}
          </Button>
        </div>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl p-5">
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
        {isLoading
          ? <div className="p-6 space-y-2">{[1,2,3].map(i => <div key={i} className="h-12 bg-muted rounded animate-pulse" />)}</div>
          : !tickets?.length
            ? (
              <div className="p-12 text-center">
                <Plane className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-foreground font-medium mb-1">No Umrah tickets yet</p>
                <p className="text-muted-foreground text-sm mb-4">Add manually or use AI Import to bulk-add from a schedule</p>
                <Button variant="outline" onClick={() => setShowImport(true)} className="border-primary/30 text-primary hover:bg-primary/10">
                  <Sparkles className="w-4 h-4 mr-2" /> Try AI Import
                </Button>
              </div>
            )
            : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      {["Airline", "Flight No", "Origin", "Depart", "Time", "Return", "Baggage", "Meal", "Seats", "Price", "Status", ""].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(tickets as any[]).map((t: any) => (
                      <tr key={t.id} className="hover:bg-muted/30 transition-colors" data-testid={`umrah-admin-row-${t.id}`}>
                        <td className="px-4 py-3 font-medium text-foreground">{t.airline}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{t.flightNumber || "—"}</td>
                        <td className="px-4 py-3 text-foreground">{t.origin}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{t.travelDate}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{t.departureTime || "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{t.returnDate}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{t.baggage || "—"}</td>
                        <td className="px-4 py-3 text-xs">{t.mealIncluded !== false ? <span className="text-green-400">Yes</span> : <span className="text-red-400">No</span>}</td>
                        <td className="px-4 py-3 text-foreground">{t.seatsAvailable}</td>
                        <td className="px-4 py-3 font-semibold text-primary whitespace-nowrap">PKR {t.price.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[t.status]}`}>{t.status}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(t)} className="h-7 w-7 p-0"><Edit2 className="w-3 h-3" /></Button>
                            <Button size="sm" variant="outline" onClick={() => handleDelete(t.id)} className="h-7 w-7 p-0 text-red-400 border-red-500/20"><Trash2 className="w-3 h-3" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
        }
      </div>
    </div>
  );
}
