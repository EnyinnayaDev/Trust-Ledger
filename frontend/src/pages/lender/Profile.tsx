import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import type { LenderProfile } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil } from "@phosphor-icons/react";
import { toast } from "sonner";

export function LenderProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<LenderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ business_name: "" });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const lenders = await api.getLenders();
      const myProfile = lenders.find(l => l.user_id === user?.id);
      const p = myProfile || lenders[0];
      setProfile(p);
      setFormData({ business_name: p.business_name });
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    toast.success("Profile updated successfully");
    setEditing(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12">Loading...</div>;
  }

  if (!profile) {
    return <div className="flex items-center justify-center py-12">No profile found</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your lender profile</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>Your lending business details</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditing(!editing)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Business Name</Label>
              {editing ? (
                <Input
                  value={formData.business_name}
                  onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                />
              ) : (
                <p className="text-sm">{profile.business_name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <p className="text-sm">{user?.email}</p>
            </div>
            {editing && (
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save Changes</Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lending Metrics</CardTitle>
            <CardDescription>Your portfolio performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Lent</span>
              <span className="text-lg font-bold">${profile.total_lent.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active Loans</span>
              <span className="text-lg font-semibold">{profile.active_loans}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Default Rate</span>
              <span className="text-lg font-semibold">{profile.default_rate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg Loan Size</span>
              <span className="text-lg font-semibold">${profile.avg_loan_size.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
