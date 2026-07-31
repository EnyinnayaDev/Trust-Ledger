import { useEffect, useState } from "react";
import { api, type TraderProfile, type Transaction, type VouchNetwork } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendUp, TrendDown, Handshake, Shield, ChartBar } from "@phosphor-icons/react";
import { motion } from "framer-motion";

export function TraderDashboard() {
  const [profile, setProfile] = useState<TraderProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [network, setNetwork] = useState<VouchNetwork | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileData, txData, networkData] = await Promise.all([
        api.getMyProfile(),
        api.getTransactions(),
        api.getMyNetwork(),
      ]);
      setProfile(profileData);
      setTransactions(txData);
      setNetwork(networkData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-12">Loading...</div>;
  if (error) return <div className="flex items-center justify-center py-12 text-red-500">{error}</div>;
  if (!profile) return <div className="flex items-center justify-center py-12">No profile found</div>;

  const breakdown = profile.score_breakdown;
  const scoreColor = profile.trust_score >= 700 ? "text-green-600" : profile.trust_score >= 550 ? "text-yellow-600" : "text-red-600";
  const scoreLabel = profile.trust_score >= 700 ? "Low Risk" : profile.trust_score >= 550 ? "Medium Risk" : "High Risk";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground">{profile.market_name} · {profile.state}</p>
      </div>

      {/* Score hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-2 md:flex-row md:justify-between">
              <div className="text-center md:text-left">
                <p className="text-sm font-medium text-muted-foreground">Your Trust Score</p>
                <p className={`text-7xl font-bold tracking-tight ${scoreColor}`}>
                  {profile.trust_score}
                </p>
                <p className="text-sm font-medium text-muted-foreground">out of 850</p>
                <span className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                  profile.trust_score >= 700 ? "bg-green-100 text-green-700" :
                  profile.trust_score >= 550 ? "bg-yellow-100 text-yellow-700" :
                  "bg-red-100 text-red-700"
                }`}>{scoreLabel}</span>
              </div>

              {/* Score breakdown bars */}
              {breakdown && (
                <div className="w-full max-w-sm space-y-3">
                  <ScoreBar label="Transaction Consistency" value={breakdown.transaction_consistency} max={150} />
                  <ScoreBar label="Income Trend" value={Math.max(0, breakdown.income_trend)} max={150} />
                  <ScoreBar label="Vouch Network" value={breakdown.vouch_network.score_contribution} max={100} />
                  <ScoreBar label="Loan History" value={Math.max(0, breakdown.loan_history.score_contribution)} max={100} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats row */}
      <div className="grid gap-4 md:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Vouches Received</CardTitle>
              <Handshake className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{network?.vouches_received.length || 0}</div>
              <p className="text-xs text-muted-foreground">traders backing you</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <ChartBar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transactions.length}</div>
              <p className="text-xs text-muted-foreground">total logged</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Fraud Flags</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {breakdown?.fraud_flags.unresolved_count || 0}
              </div>
              <p className="text-xs text-muted-foreground">unresolved flags</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-6">
              No transactions yet. Start logging your daily sales to build your score.
            </p>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 6).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="text-sm font-medium capitalize">{tx.transaction_type}</p>
                    <p className="text-xs text-muted-foreground">{tx.date}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${tx.transaction_type === "expense" || tx.transaction_type === "debt" ? "text-red-600" : "text-green-600"}`}>
                      {tx.transaction_type === "sale" ? "+" : "-"}₦{parseFloat(tx.amount).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">{tx.note || "—"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ScoreBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{Math.round(value)}/{max}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted">
        <div
          className="h-2 rounded-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}