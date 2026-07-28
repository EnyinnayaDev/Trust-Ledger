import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { TraderProfile, LenderProfile, Transaction } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartBar, ChartLineUp, ChartDonut } from "@phosphor-icons/react";
import { motion } from "framer-motion";

export function AdminAnalytics() {
  const [traders, setTraders] = useState<TraderProfile[]>([]);
  const [lenders, setLenders] = useState<LenderProfile[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [trds, lnds, txs] = await Promise.all([
        api.getTraders(),
        api.getLenders(),
        api.getTransactions(),
      ]);

      setTraders(trds);
      setLenders(lnds);
      setTransactions(txs);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12">Loading...</div>;
  }

  const totalVolume = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const avgTrustScore = Math.round(traders.reduce((sum, t) => sum + t.trust_score, 0) / traders.length);
  const completedTx = transactions.filter(tx => tx.status === "completed").length;
  const defaultedTx = transactions.filter(tx => tx.status === "defaulted").length;
  const successRate = Math.round((completedTx / transactions.length) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Platform performance metrics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
              <ChartBar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalVolume.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">across {transactions.length} transactions</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Trust Score</CardTitle>
              <ChartLineUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgTrustScore}</div>
              <p className="text-xs text-muted-foreground">across all traders</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <ChartDonut className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{successRate}%</div>
              <p className="text-xs text-muted-foreground">{completedTx} completed, {defaultedTx} defaulted</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <ChartBar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{traders.length + lenders.length}</div>
              <p className="text-xs text-muted-foreground">{traders.length} traders, {lenders.length} lenders</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Trust Score Distribution</CardTitle>
            <CardDescription>Breakdown of trader trust scores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: "Excellent (80-100)", count: traders.filter(t => t.trust_score >= 80).length, color: "bg-green-500" },
                { label: "Good (60-79)", count: traders.filter(t => t.trust_score >= 60 && t.trust_score < 80).length, color: "bg-yellow-500" },
                { label: "Fair (40-59)", count: traders.filter(t => t.trust_score >= 40 && t.trust_score < 60).length, color: "bg-orange-500" },
                { label: "Poor (0-39)", count: traders.filter(t => t.trust_score < 40).length, color: "bg-red-500" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">{item.label}</span>
                    <span className="text-sm font-medium">{item.count}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className={`h-2 rounded-full ${item.color}`}
                      style={{ width: `${(item.count / traders.length) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction Status</CardTitle>
            <CardDescription>Breakdown of transaction outcomes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: "Completed", count: transactions.filter(tx => tx.status === "completed").length, color: "bg-green-500" },
                { label: "Pending", count: transactions.filter(tx => tx.status === "pending").length, color: "bg-yellow-500" },
                { label: "Defaulted", count: transactions.filter(tx => tx.status === "defaulted").length, color: "bg-red-500" },
                { label: "Disputed", count: transactions.filter(tx => tx.status === "disputed").length, color: "bg-orange-500" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">{item.label}</span>
                    <span className="text-sm font-medium">{item.count}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className={`h-2 rounded-full ${item.color}`}
                      style={{ width: `${(item.count / transactions.length) * 100}%` }}
                    />
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
