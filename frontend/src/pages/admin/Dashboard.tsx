import { useEffect, useState } from "react";
import { api, type FraudFlag, type Lender } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function AdminDashboard() {
  const [pendingLenders, setPendingLenders] = useState<Lender[]>([]);
  const [fraudFlags, setFraudFlags] = useState<FraudFlag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [lenders, flags] = await Promise.all([
        api.getPendingLenders(),
        api.getFraudFlags(),
      ]);
      setPendingLenders(lenders);
      setFraudFlags(flags);
    } catch (err) {
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: number) => {
    try {
      await api.verifyLender(id);
      toast.success("Lender verified successfully");
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to verify lender");
    }
  };

  if (loading) return <div className="flex items-center justify-center py-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage lenders, traders, and fraud flags</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Pending Lender Verifications</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{pendingLenders.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Open Fraud Flags</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">
              {fraudFlags.filter(f => !f.resolved).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending lenders */}
      <Card>
        <CardHeader><CardTitle>Pending Lender Verifications</CardTitle></CardHeader>
        <CardContent>
          {pendingLenders.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-6">No pending verifications.</p>
          ) : (
            <div className="space-y-3">
              {pendingLenders.map((lender) => (
                <div key={lender.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">{lender.institution_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(lender.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => handleVerify(lender.id)}>
                    Verify
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fraud flags */}
      <Card>
        <CardHeader><CardTitle>Recent Fraud Flags</CardTitle></CardHeader>
        <CardContent>
          {fraudFlags.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-6">No fraud flags.</p>
          ) : (
            <div className="space-y-3">
              {fraudFlags.slice(0, 5).map((flag) => (
                <div key={flag.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Trader #{flag.trader}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      flag.resolved ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {flag.resolved ? "Resolved" : "Open"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{flag.reason}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(flag.flagged_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}