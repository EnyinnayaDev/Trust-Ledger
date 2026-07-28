import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import type { TraderProfile, Transaction, Vouch } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendUp, TrendDown, Handshake, Shield, Clock } from "@phosphor-icons/react";
import { motion } from "framer-motion";

export function TraderDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<TraderProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [vouches, setVouches] = useState<Vouch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [traders, txs, vouchs] = await Promise.all([
        api.getTraders(),
        api.getTransactions(),
        api.getVouches(),
      ]);

      const myProfile = traders.find(t => t.user_id === user?.id);
      setProfile(myProfile || traders[0]);
      setTransactions(txs.filter(tx => tx.trader_id === (myProfile?.id || traders[0]?.id)));
      setVouches(vouchs.filter(v => v.vouchee_id === (myProfile?.id || traders[0]?.id)));
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12">Loading...</div>;
  }

  if (!profile) {
    return <div className="flex items-center justify-center py-12">No profile found</div>;
  }

  const pendingTx = transactions.filter(tx => tx.status === "pending");
  const completedTx = transactions.filter(tx => tx.status === "completed");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {profile.full_name.split(" ")[0]}</h1>
        <p className="text-muted-foreground">Here's your trading activity overview</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trust Score</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile.trust_score}</div>
              <p className="text-xs text-muted-foreground">out of 100</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vouches</CardTitle>
              <Handshake className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile.vouch_count}</div>
              <p className="text-xs text-muted-foreground">total endorsements</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingTx.length}</div>
              <p className="text-xs text-muted-foreground">pending transactions</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              {profile.successful_loans > profile.defaulted_loans ? (
                <TrendUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round((profile.successful_loans / (profile.successful_loans + profile.defaulted_loans)) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {profile.successful_loans} successful, {profile.defaulted_loans} defaulted
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest lending activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.slice(0, 5).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{tx.lender_name}</p>
                    <p className="text-xs text-muted-foreground">{tx.created_at}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">${tx.amount.toLocaleString()}</p>
                    <p className={`text-xs capitalize ${
                      tx.status === "completed" ? "text-green-600" :
                      tx.status === "pending" ? "text-yellow-600" :
                      tx.status === "defaulted" ? "text-red-600" :
                      "text-orange-600"
                    }`}>
                      {tx.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vouches Received</CardTitle>
            <CardDescription>Endorsements from other traders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {vouches.slice(0, 5).map((vouch) => (
                <div key={vouch.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{vouch.voucher_name}</p>
                    <p className="text-xs text-muted-foreground">{vouch.relationship}</p>
                  </div>
                  <div className={`rounded-full px-2 py-1 text-xs font-medium ${
                    vouch.status === "accepted" ? "bg-green-100 text-green-700" :
                    vouch.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {vouch.status}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
