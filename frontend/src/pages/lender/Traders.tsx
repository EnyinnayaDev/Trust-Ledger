import { useState } from "react";
import { api, type TraderProfile, type ScoreBreakdown } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function LenderTraders() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TraderProfile[]>([]);
  const [selected, setSelected] = useState<TraderProfile | null>(null);
  const [breakdown, setBreakdown] = useState<ScoreBreakdown | null>(null);
  const [loading, setLoading] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [outcome, setOutcome] = useState<"repaid" | "defaulted" | "late">("repaid");
  const [loanAmount, setLoanAmount] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.searchTraders(query);
      setResults(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (trader: TraderProfile) => {
    setSelected(trader);
    try {
      const data = await api.getTraderScore(trader.id);
      setBreakdown(data);
    } catch (err) {
      toast.error("Failed to load score breakdown");
    }
  };

  const handleReportOutcome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setReporting(true);
    try {
      await api.reportLoanOutcome({
        trader: selected.id,
        amount: parseFloat(loanAmount),
        outcome,
      });
      toast.success("Loan outcome reported — trader score updated");
      setLoanAmount("");
      const data = await api.getTraderScore(selected.id);
      setBreakdown(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to report outcome");
    } finally {
      setReporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Evaluate Traders</h1>
        <p className="text-muted-foreground">Search for a trader to view their full credit profile</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              placeholder="Search by name, phone, or market..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </form>
        </CardContent>
      </Card>

      {results.length > 0 && !selected && (
        <Card>
          <CardHeader><CardTitle>Results</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((trader) => (
                <div
                  key={trader.id}
                  className="flex cursor-pointer items-center justify-between rounded-lg border p-4 hover:bg-accent"
                  onClick={() => handleSelect(trader)}
                >
                  <div>
                    <p className="font-medium">{trader.market_name}</p>
                    <p className="text-sm text-muted-foreground">{trader.state} · {trader.phone_number}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${trader.trust_score >= 700 ? "text-green-600" : trader.trust_score >= 550 ? "text-yellow-600" : "text-red-600"}`}>
                      {trader.trust_score}
                    </p>
                    <p className="text-xs text-muted-foreground">Trust Score</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selected && breakdown && (
        <div className="space-y-4">
          <Button variant="outline" onClick={() => { setSelected(null); setBreakdown(null); }}>
            ← Back to results
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Credit Profile — {selected.market_name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Phone: {selected.phone_number}</p>
                  <p className="text-sm text-muted-foreground">State: {selected.state}</p>
                  <p className="text-sm text-muted-foreground">Member since: {new Date(selected.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-center">
                  <p className={`text-6xl font-bold ${breakdown.final_score >= 700 ? "text-green-600" : breakdown.final_score >= 550 ? "text-yellow-600" : "text-red-600"}`}>
                    {breakdown.final_score}
                  </p>
                  <p className="text-sm text-muted-foreground">out of 850</p>
                </div>
              </div>

              {/* Breakdown */}
              <div className="space-y-3 rounded-lg bg-muted/50 p-4">
                <p className="text-sm font-semibold">Score Breakdown</p>
                <ScoreRow label="Transaction Consistency" value={breakdown.transaction_consistency} max={150} />
                <ScoreRow label="Income Trend" value={Math.max(0, breakdown.income_trend)} max={150} />
                <ScoreRow label="Vouch Network" value={breakdown.vouch_network.score_contribution} max={100} />
                <ScoreRow label="Loan Repayment" value={Math.max(0, breakdown.loan_history.score_contribution)} max={100} />
                <div className="flex justify-between text-xs pt-2 border-t">
                  <span>Vouchers: {breakdown.vouch_network.voucher_count}</span>
                  <span>Repaid: {breakdown.loan_history.repaid}</span>
                  <span>Defaulted: {breakdown.loan_history.defaulted}</span>
                  <span className="text-red-600">Flags: {breakdown.fraud_flags.unresolved_count}</span>
                </div>
              </div>

              {/* Report outcome */}
              <div className="space-y-3 border-t pt-4">
                <p className="text-sm font-semibold">Report Loan Outcome</p>
                <form onSubmit={handleReportOutcome} className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    {(["repaid", "late", "defaulted"] as const).map((o) => (
                      <button
                        key={o}
                        type="button"
                        onClick={() => setOutcome(o)}
                        className={`rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-all ${
                          outcome === o
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-muted-foreground"
                        }`}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    placeholder="Loan amount (₦)"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    className="w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                  <Button type="submit" className="w-full" disabled={reporting}>
                    {reporting ? "Submitting..." : "Submit Outcome"}
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function ScoreRow({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{Math.round(value)}/{max}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted">
        <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}