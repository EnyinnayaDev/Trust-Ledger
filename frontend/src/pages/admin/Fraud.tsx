import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { FraudFlag } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Check, X } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export function AdminFraud() {
  const [fraudFlags, setFraudFlags] = useState<FraudFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadFraudFlags();
  }, []);

  const loadFraudFlags = async () => {
    try {
      const flags = await api.getFraudFlags();
      setFraudFlags(flags);
    } catch (error) {
      console.error("Failed to load fraud flags:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: FraudFlag["status"]) => {
    try {
      await api.updateFraudFlag(id, status);
      toast.success(`Fraud flag ${status}`);
      loadFraudFlags();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update flag");
    }
  };

  const filtered = fraudFlags.filter(f =>
    statusFilter === "all" || f.status === statusFilter
  );

  if (loading) {
    return <div className="flex items-center justify-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fraud Flags</h1>
        <p className="text-muted-foreground">Review and manage fraud reports</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Fraud Flags</CardTitle>
              <CardDescription>{filtered.length} flags found</CardDescription>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filtered.map((flag, i) => (
              <motion.div
                key={flag.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-lg border p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-5 w-5 text-red-600" weight="fill" />
                      <h3 className="font-semibold">{flag.trader_name}</h3>
                      <Badge
                        variant={
                          flag.status === "resolved" ? "default" :
                          flag.status === "pending" ? "secondary" :
                          "outline"
                        }
                      >
                        {flag.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{flag.reason}</p>
                    <p className="text-xs text-muted-foreground">
                      Reported by: {flag.reported_by} • {flag.created_at}
                    </p>
                  </div>
                  {flag.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(flag.id, "resolved")}
                        className="gap-1"
                      >
                        <Check className="h-4 w-4" />
                        Resolve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(flag.id, "dismissed")}
                        className="gap-1"
                      >
                        <X className="h-4 w-4" />
                        Dismiss
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
