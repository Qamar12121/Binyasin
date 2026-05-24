import { useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, Plus, ArrowUpRight, ArrowDownRight, Search } from "lucide-react";
import { useListAllTransactions, useCreateTransaction, getListAllTransactionsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  agentId: z.number().min(1),
  type: z.enum(["credit", "debit"]),
  amount: z.number().min(1),
  description: z.string().min(1, "Required"),
  bookingReference: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function AdminTransactionsPage() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const { data: transactions, isLoading } = useListAllTransactions();
  const createTx = useCreateTransaction();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: "credit", amount: 0, description: "", bookingReference: "" },
  });

  const filtered = transactions?.filter(t =>
    t.description.toLowerCase().includes(search.toLowerCase()) ||
    (t as any).agentName?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const onSubmit = (data: FormData) => {
    createTx.mutate({ data } as any, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListAllTransactionsQueryKey() }); setShowForm(false); reset(); toast({ title: "Transaction created" }); },
      onError: () => toast({ title: "Failed", variant: "destructive" }),
    });
  };

  const totalCredit = transactions?.filter(t => t.type === "credit").reduce((s, t) => s + t.amount, 0) || 0;
  const totalDebit = transactions?.filter(t => t.type === "debit").reduce((s, t) => s + t.amount, 0) || 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-serif font-bold text-foreground">Transactions</h1><p className="text-muted-foreground text-sm mt-1">Manage all agent ledger transactions</p></div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-primary text-primary-foreground" data-testid="button-add-transaction">
          <Plus className="w-4 h-4 mr-2" />{showForm ? "Cancel" : "Add Transaction"}
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Total Credits", value: totalCredit, color: "text-green-400", bg: "bg-green-500/10", icon: ArrowUpRight },
          { label: "Total Debits", value: totalDebit, color: "text-red-400", bg: "bg-red-500/10", icon: ArrowDownRight },
          { label: "Net Balance", value: totalCredit - totalDebit, color: "text-primary", bg: "bg-primary/10", icon: DollarSign },
        ].map((c, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4">
            <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center mb-2`}><c.icon className={`w-4 h-4 ${c.color}`} /></div>
            <div className="text-xs text-muted-foreground">{c.label}</div>
            <div className={`font-serif text-xl font-bold ${c.color}`}>PKR {c.value.toLocaleString()}</div>
          </div>
        ))}
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">New Transaction</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Agent ID *</label>
              <Input {...register("agentId", { valueAsNumber: true })} type="number" placeholder="Agent ID" className="h-9" data-testid="input-agent-id" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Type *</label>
              <Select defaultValue="credit" onValueChange={v => setValue("type", v as any)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="credit">Credit</SelectItem><SelectItem value="debit">Debit</SelectItem></SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Amount (PKR) *</label>
              <Input {...register("amount", { valueAsNumber: true })} type="number" className="h-9" data-testid="input-tx-amount" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Booking Ref</label>
              <Input {...register("bookingReference")} placeholder="BYT-..." className="h-9" />
            </div>
            <div className="col-span-2 md:col-span-4">
              <label className="text-xs text-muted-foreground mb-1 block">Description *</label>
              <Input {...register("description")} placeholder="e.g. Payment received for group booking" className="h-9" data-testid="input-tx-description" />
            </div>
            <div className="col-span-2 md:col-span-4 flex gap-2">
              <Button type="submit" className="bg-primary text-primary-foreground" disabled={createTx.isPending} data-testid="button-save-transaction">Create</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search transactions..." className="pl-9 h-9" data-testid="input-search-transactions" />
          </div>
        </div>
        {isLoading ? <div className="p-6 space-y-2">{[1,2,3].map(i => <div key={i} className="h-12 bg-muted rounded animate-pulse" />)}</div>
        : filtered.length === 0 ? <div className="p-12 text-center"><DollarSign className="w-8 h-8 text-muted-foreground mx-auto mb-2" /><p className="text-muted-foreground text-sm">No transactions yet.</p></div>
        : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/50">
                {["Date", "Agent", "Description", "Booking Ref", "Type", "Amount"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-border">
                {filtered.map(t => (
                  <tr key={t.id} className="hover:bg-muted/30" data-testid={`tx-row-${t.id}`}>
                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-foreground text-xs">{(t as any).agentName || `Agent #${t.agentId}`}</td>
                    <td className="px-4 py-3 text-foreground text-xs">{t.description}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs font-mono">{t.bookingReference || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${t.type === "credit" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                        {t.type === "credit" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {t.type}
                      </span>
                    </td>
                    <td className={`px-4 py-3 font-semibold whitespace-nowrap ${t.type === "credit" ? "text-green-400" : "text-red-400"}`}>
                      {t.type === "credit" ? "+" : "-"}PKR {t.amount.toLocaleString()}
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
