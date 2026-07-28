import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import type { TraderProfile } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Pencil } from "@phosphor-icons/react";
import { toast } from "sonner";

export function TraderProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<TraderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ full_name: "", phone: "" });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const traders = await api.getTraders();
      const myProfile = traders.find(t => t.user_id === user?.id);
      const p = myProfile || traders[0];
      setProfile(p);
      setFormData({ full_name: p.full_name, phone: p.phone });
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
        <p className="text-muted-foreground">Manage your trader profile</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Your contact details and identity</CardDescription>
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
              <Label>Full Name</Label>
              {editing ? (
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              ) : (
                <p className="text-sm">{profile.full_name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              {editing ? (
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              ) : (
                <p className="text-sm">{profile.phone}</p>
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
            <CardTitle>Trust Metrics</CardTitle>
            <CardDescription>Your reputation score</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Trust Score</span>
              <span className="text-2xl font-bold">{profile.trust_score}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Vouches</span>
              <span className="text-lg font-semibold">{profile.vouch_count}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Transactions</span>
              <span className="text-lg font-semibold">{profile.total_transactions}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Success Rate</span>
              <span className="text-lg font-semibold">
                {Math.round((profile.successful_loans / (profile.successful_loans + profile.defaulted_loans)) * 100)}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
