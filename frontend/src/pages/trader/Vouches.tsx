import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Vouch } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Handshake } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export function TraderVouches() {
  const [vouches, setVouches] = useState<Vouch[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newVouch, setNewVouch] = useState({ vouchee_name: "", relationship: "" });

  useEffect(() => {
    loadVouches();
  }, []);

  const loadVouches = async () => {
    try {
      const vouchs = await api.getVouches();
      setVouches(vouchs);
    } catch (error) {
      console.error("Failed to load vouches:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVouch = async () => {
    try {
      await api.createVouch({
        vouchee_name: newVouch.vouchee_name,
        relationship: newVouch.relationship,
        status: "pending",
      });
      toast.success("Vouch created successfully");
      setDialogOpen(false);
      setNewVouch({ vouchee_name: "", relationship: "" });
      loadVouches();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create vouch");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vouches</h1>
          <p className="text-muted-foreground">Manage your trust endorsements</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Vouch
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Vouch</DialogTitle>
              <DialogDescription>
                Endorse another trader's trustworthiness
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Trader Name</Label>
                <Input
                  placeholder="Enter trader's full name"
                  value={newVouch.vouchee_name}
                  onChange={(e) => setNewVouch({ ...newVouch, vouchee_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Relationship</Label>
                <Select
                  value={newVouch.relationship}
                  onValueChange={(value) => setNewVouch({ ...newVouch, relationship: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Business partner">Business partner</SelectItem>
                    <SelectItem value="Market neighbor">Market neighbor</SelectItem>
                    <SelectItem value="Supplier">Supplier</SelectItem>
                    <SelectItem value="Customer">Customer</SelectItem>
                    <SelectItem value="Family friend">Family friend</SelectItem>
                    <SelectItem value="Former colleague">Former colleague</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateVouch}>Create Vouch</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {vouches.map((vouch, i) => (
          <motion.div
            key={vouch.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Handshake className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">{vouch.voucher_name}</CardTitle>
                  </div>
                  <Badge
                    variant={
                      vouch.status === "accepted" ? "default" :
                      vouch.status === "pending" ? "secondary" :
                      "destructive"
                    }
                  >
                    {vouch.status}
                  </Badge>
                </div>
                <CardDescription>{vouch.relationship}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Vouched for: <span className="font-medium text-foreground">{vouch.vouchee_name}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Created: {vouch.created_at}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
