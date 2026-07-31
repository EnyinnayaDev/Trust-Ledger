import { useEffect, useState } from "react";
import { api, type FraudFlag } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export function AdminFraud() {
  const [flags, setFlags] = useState<FraudFlag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFlags();
  }, []);

  const loadFlags = async () => {
    try {
      const data = await api.getFraudFlags();
      setFlags(data);
    } catch (err) {
      toast.error("Failed to load fraud flags");
    } finally {
      setLoading(false);
    }
  };

  const open = flags.filter(f => !f.resolved);
  const resolved = flags.filter(f => f.resolved);

  if (loading) return <div className="flex items-center justify-center py-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fraud Flags</h1>
        <p className="text-muted-foreground">
          {open.length} open · {resolved.length} resolved
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle>Open Flags ({open.length})</CardTitle></CardHeader>
        <CardContent>
          {open.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-6">No open flags.</p>
          ) : (
            <div className="space-y-3">
              {open.map((flag) => (
                <div key={flag.id} className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-red-800">Trader #{flag.trader}</p>
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                      Open
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-red-700">{flag.reason}</p>
                  <p className="mt-1 text-xs text-red-500">
                    Flagged {new Date(flag.flagged_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Resolved Flags ({resolved.length})</CardTitle></CardHeader>
        <CardContent>
          {resolved.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-6">No resolved flags.</p>
          ) : (
            <div className="space-y-3">
              {resolved.map((flag) => (
                <div key={flag.id} className="rounded-lg border p-4 opacity-60">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">Trader #{flag.trader}</p>
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      Resolved
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{flag.reason}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Flagged {new Date(flag.flagged_at).toLocaleDateString()}
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