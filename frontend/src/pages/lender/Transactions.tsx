import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { LoanOutcome } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MagnifyingGlass, Funnel } from "@phosphor-icons/react";
import { motion } from "framer-motion";

export function LenderTransactions() {
  const [transactions, setTransactions] = useState<LoanOutcome[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const txs = await api.getLoanOutcomes();
      setTransactions(txs);
    } catch (error) {
      console.error("Failed to load loan outcomes:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = transactions.filter(tx => {
    const term = search.toLowerCase();
    const matchesSearch =
      String(tx.trader).includes(term) ||
      String(tx.lender).includes(term) ||
      tx.outcome.toLowerCase().includes(term);
    const matchesStatus = statusFilter === "all" || tx.outcome === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="flex items-center justify-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Loan Outcomes</h1>
        <p className="text-muted-foreground">Track reported repayment outcomes</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Loan Outcomes</CardTitle>
          <CardDescription>{filtered.length} outcomes found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <MagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by trader id, lender id, or outcome..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <Funnel className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by outcome" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Outcomes</SelectItem>
                <SelectItem value="repaid">Repaid</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="defaulted">Defaulted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {filtered.map((tx, i) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex-1">
                  <p className="font-medium">Trader #{tx.trader}</p>
                  <p className="text-sm text-muted-foreground">
                    Lender #{tx.lender} • Reported: {tx.reported_at}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold">${Number(tx.amount).toLocaleString()}</p>
                  </div>
                  <Badge
                    variant={
                      tx.outcome === "repaid" ? "default" :
                      tx.outcome === "late" ? "secondary" :
                      tx.outcome === "defaulted" ? "destructive" :
                      "outline"
                    }
                    className="capitalize"
                  >
                    {tx.outcome}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
