import { useEffect, useState } from "react";
import { api, type VouchNetwork } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function TraderVouches() {
  const [network, setNetwork] = useState<VouchNetwork | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [voucheeId, setVoucheeId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadNetwork();
  }, []);

  const loadNetwork = async () => {
    try {
      const data = await api.getMyNetwork();
      setNetwork(data);
    } catch (err) {
      toast.error("Failed to load vouch network");
    } finally {
      setLoading(false);
    }
  };

  const handleVouch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createVouch(parseInt(voucheeId));
      toast.success("Vouch created successfully");
      setShowForm(false);
      setVoucheeId("");
      loadNetwork();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create vouch");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vouch Network</h1>
          <p className="text-muted-foreground">Your trust relationships with other traders</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Vouch for Someone"}
        </Button>
      </div>

      {showForm && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle>Vouch for a Trader</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVouch} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="voucheeId">Trader ID</Label>
                <Input
                  id="voucheeId"
                  type="number"
                  placeholder="Enter the trader's ID"
                  value={voucheeId}
                  onChange={(e) => setVoucheeId(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  ⚠️ Warning: If this trader defaults, it will negatively affect your own trust score.
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Submitting..." : "Confirm Vouch"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Vouches Received ({network?.vouches_received.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {network?.vouches_received.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-6">
                No one has vouched for you yet.
              </p>
            ) : (
              <div className="space-y-3">
                {network?.vouches_received.map((v) => (
                  <div key={v.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div>
                      <p className="text-sm font-medium">Trader #{v.voucher}</p>
                      <p className="text-xs text-muted-foreground">{new Date(v.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vouches Given ({network?.vouches_given.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {network?.vouches_given.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-6">
                You haven't vouched for anyone yet.
              </p>
            ) : (
              <div className="space-y-3">
                {network?.vouches_given.map((v) => (
                  <div key={v.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div>
                      <p className="text-sm font-medium">Trader #{v.vouchee}</p>
                      <p className="text-xs text-muted-foreground">{new Date(v.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                      Vouching
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}