import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { TraderProfile, LenderProfile, Transaction, FraudFlag } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Handshake, CurrencyDollar, Shield } from "@phosphor-icons/react";
import { motion } from "framer-motion";

export function AdminDashboard() {
  const [traders, setTraders] = useState<TraderProfile[]>([]);
  const [lenders, setLenders] = useState<LenderProfile[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [fraudFlags, setFraudFlags] = useState<FraudFlag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [trds, lnds, txs, flags] = await Promise.all([
        api.getTraders(),
        api.getLenders(),
        api.getTransactions(),
        api.getFraudFlags(),
      ]);

      setTraders(trds);
      setLenders(lnds);
      setTransactions(txs);
      setFraudFlags(flags);
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
  const pendingFlags = fraudFlags.filter(f => f.status === "pending").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and metrics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Traders</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{traders.length}</div>
              <p className="text-xs text-muted-foreground">registered traders</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Lenders</CardTitle>
              <Handshake className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lenders.length}</div>
              <p className="text-xs text-muted-foreground">active lenders</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
              <CurrencyDollar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalVolume.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">across all transactions</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fraud Flags</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingFlags}</div>
              <p className="text-xs text-muted-foreground">pending review</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest platform activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.slice(0, 5).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{tx.trader_name} ← {tx.lender_name}</p>
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
            <CardTitle>Recent Fraud Flags</CardTitle>
            <CardDescription>Flags requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {fraudFlags.slice(0, 5).map((flag) => (
                <div key={flag.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{flag.trader_name}</p>
                    <p className="text-xs text-muted-foreground">{flag.reason}</p>
                  </div>
                  <div className={`rounded-full px-2 py-1 text-xs font-medium ${
                    flag.status === "resolved" ? "bg-green-100 text-green-700" :
                    flag.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {flag.status}
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
