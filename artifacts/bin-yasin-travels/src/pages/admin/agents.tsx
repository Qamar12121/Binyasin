import { useState } from "react";
import { motion } from "framer-motion";
import { Users, CheckCircle, XCircle, Search } from "lucide-react";
import { useListAgents, useApproveAgent, getListAgentsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  approved: "bg-green-500/10 text-green-400 border-green-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function AdminAgentsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: agents, isLoading } = useListAgents();
  const approveAgent = useApproveAgent();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const filtered = (agents || []).filter(a => {
    const matchSearch = a.agencyName.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      a.city.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListAgentsQueryKey() });

  const handleApprove = (id: number) => {
    approveAgent.mutate({ id, data: { status: "approved" } }, {
      onSuccess: () => { invalidate(); toast({ title: "Agent approved successfully!" }); },
      onError: () => toast({ title: "Action failed", variant: "destructive" }),
    });
  };

  const handleReject = (id: number) => {
    if (!confirm("Reject this agent application?")) return;
    approveAgent.mutate({ id, data: { status: "rejected" } }, {
      onSuccess: () => { invalidate(); toast({ title: "Agent rejected" }); },
      onError: () => toast({ title: "Action failed", variant: "destructive" }),
    });
  };

  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-serif font-bold text-foreground">Agents</h1><p className="text-muted-foreground text-sm mt-1">Manage agent registrations and approvals</p></div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search agents..." className="pl-9 h-9" data-testid="input-search-agents" />
        </div>
        <Select defaultValue="all" onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? <div className="p-6 space-y-2">{[1,2,3].map(i => <div key={i} className="h-14 bg-muted rounded animate-pulse" />)}</div>
        : filtered.length === 0 ? <div className="p-12 text-center"><Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" /><p className="text-muted-foreground text-sm">No agents found.</p></div>
        : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/50">
                {["Agency", "Contact", "City", "Registered", "Status", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-border">
                {filtered.map(agent => (
                  <motion.tr key={agent.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="hover:bg-muted/30 transition-colors" data-testid={`agent-row-${agent.id}`}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{agent.agencyName}</div>
                      <div className="text-xs text-muted-foreground">{agent.fullName}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-foreground text-xs">{agent.email}</div>
                      <div className="text-muted-foreground text-xs">{agent.cellNumber}</div>
                    </td>
                    <td className="px-4 py-3 text-foreground text-sm">{agent.city}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{new Date(agent.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[agent.status]}`}>{agent.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {agent.status === "pending" && (
                          <>
                            <Button size="sm" onClick={() => handleApprove(agent.id)}
                              className="h-7 bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 text-xs px-2"
                              data-testid={`button-approve-${agent.id}`}>
                              <CheckCircle className="w-3 h-3 mr-1" />Approve
                            </Button>
                            <Button size="sm" onClick={() => handleReject(agent.id)}
                              className="h-7 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 text-xs px-2"
                              data-testid={`button-reject-${agent.id}`}>
                              <XCircle className="w-3 h-3 mr-1" />Reject
                            </Button>
                          </>
                        )}
                        {agent.status === "approved" && (
                          <Button size="sm" onClick={() => handleReject(agent.id)}
                            className="h-7 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 text-xs px-2">
                            <XCircle className="w-3 h-3 mr-1" />Revoke
                          </Button>
                        )}
                        {agent.status === "rejected" && (
                          <Button size="sm" onClick={() => handleApprove(agent.id)}
                            className="h-7 bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 text-xs px-2">
                            <CheckCircle className="w-3 h-3 mr-1" />Re-Approve
                          </Button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
