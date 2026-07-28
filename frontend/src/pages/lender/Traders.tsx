import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { TraderProfile } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MagnifyingGlass, Shield, ShieldCheck, ShieldWarning } from "@phosphor-icons/react";
import { motion } from "framer-motion";

export function LenderTraders() {
  const [traders, setTraders] = useState<TraderProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadTraders();
  }, []);

  const loadTraders = async () => {
    try {
      const trds = await api.getTraders();
      setTraders(trds);
    } catch (error) {
      console.error("Failed to load traders:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = traders.filter(t =>
    t.full_name.toLowerCase().includes(search.toLowerCase())
  );

  const getTrustBadge = (score: number) => {
    if (score >= 80) return { icon: ShieldCheck, color: "text-green-600", bg: "bg-green-100" };
    if (score >= 60) return { icon: Shield, color: "text-yellow-600", bg: "bg-yellow-100" };
    return { icon: ShieldWarning, color: "text-red-600", bg: "bg-red-100" };
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Traders</h1>
        <p className="text-muted-foreground">Browse and evaluate trader profiles</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Traders</CardTitle>
          <CardDescription>{filtered.length} traders available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search traders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((trader, i) => {
              const badge = getTrustBadge(trader.trust_score);
              const Icon = badge.icon;
              return (
                <motion.div
                  key={trader.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{trader.full_name}</CardTitle>
                          <CardDescription>{trader.phone}</CardDescription>
                        </div>
                        <div className={`rounded-full p-2 ${badge.bg}`}>
                          <Icon className={`h-5 w-5 ${badge.color}`} weight="fill" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Trust Score</span>
                          <Badge variant="outline" className="text-base font-bold">
                            {trader.trust_score}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Vouches</span>
                          <span className="text-sm font-medium">{trader.vouch_count}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Transactions</span>
                          <span className="text-sm font-medium">{trader.total_transactions}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Success Rate</span>
                          <span className="text-sm font-medium">
                            {Math.round((trader.successful_loans / (trader.successful_loans + trader.defaulted_loans)) * 100)}%
                          </span>
                        </div>
                        {trader.fraud_flags > 0 && (
                          <div className="mt-2 rounded-md bg-red-50 p-2">
                            <p className="text-xs text-red-600 font-medium">
                              ⚠️ {trader.fraud_flags} fraud flag{trader.fraud_flags > 1 ? "s" : ""}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
