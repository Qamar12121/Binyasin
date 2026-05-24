import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useGetLedger } from "@workspace/api-client-react";

export default function LedgerPage() {
  const { data: ledger, isLoading } = useGetLedger();

  if (isLoading) return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 bg-card border border-border rounded-xl animate-pulse" />)}</div>;

  const cards = [
    { label: "Total Credit", value: ledger?.totalCredit || 0, icon: TrendingUp, color: "text-green-400", bg: "bg-green-500/10" },
    { label: "Total Debit", value: ledger?.totalDebit || 0, icon: TrendingDown, color: "text-red-400", bg: "bg-red-500/10" },
    { label: "Current Balance", value: ledger?.balance || 0, icon: DollarSign, color: "text-primary", bg: "bg-primary/10" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground">Account Ledger</h1>
        <p className="text-muted-foreground text-sm mt-1">View your credit, debit entries and current balance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((c, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-card border border-border rounded-xl p-5">
            <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center mb-3`}>
              <c.icon className={`w-5 h-5 ${c.color}`} />
            </div>
            <div className="text-xs text-muted-foreground mb-1">{c.label}</div>
            <div className={`font-serif text-2xl font-bold ${c.color}`}>PKR {c.value.toLocaleString()}</div>
          </motion.div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground text-sm">Transaction History</h2>
        </div>
        {!ledger?.transactions?.length ? (
          <div className="p-8 text-center">
            <DollarSign className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">No transactions yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {["Date", "Description", "Booking Ref", "Type", "Amount"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ledger.transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-muted/30 transition-colors" data-testid={`transaction-row-${tx.id}`}>
                    <td className="px-4 py-3 text-foreground text-xs whitespace-nowrap">{new Date(tx.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-foreground">{tx.description}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{tx.bookingReference || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${tx.type === "credit" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                        {tx.type === "credit" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {tx.type}
                      </span>
                    </td>
                    <td className={`px-4 py-3 font-semibold ${tx.type === "credit" ? "text-green-400" : "text-red-400"}`}>
                      {tx.type === "credit" ? "+" : "-"}PKR {tx.amount.toLocaleString()}
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
