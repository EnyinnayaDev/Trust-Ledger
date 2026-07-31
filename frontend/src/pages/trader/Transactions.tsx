import { useEffect, useState } from "react";
import { api, type Transaction } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function TraderTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    transaction_type: "sale" as "sale" | "expense" | "debt",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    note: "",
  });

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const data = await api.getTransactions();
      setTransactions(data);
    } catch (err) {
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createTransaction({
        transaction_type: form.transaction_type,
        amount: parseFloat(form.amount),
        date: form.date,
        note: form.note,
      });
      toast.success("Transaction logged — your score has been updated");
      setShowForm(false);
      setForm({ transaction_type: "sale", amount: "", date: new Date().toISOString().split("T")[0], note: "" });
      loadTransactions();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to log transaction");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">Log your daily sales and expenses</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Log Transaction"}
        </Button>
      </div>

      {/* Log form */}
      {showForm && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle>New Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(["sale", "expense", "debt"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...form, transaction_type: t })}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-all ${
                        form.transaction_type === t
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₦)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">Note (optional)</Label>
                <Input
                  id="note"
                  placeholder="e.g. Daily tomato sales"
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                />
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Saving..." : "Save Transaction"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Transactions list */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History ({transactions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-sm text-muted-foreground py-6">Loading...</p>
          ) : transactions.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-6">
              No transactions yet. Log your first sale above.
            </p>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="text-sm font-medium capitalize">{tx.transaction_type}</p>
                    <p className="text-xs text-muted-foreground">{tx.date} {tx.note && `· ${tx.note}`}</p>
                  </div>
                  <p className={`text-sm font-semibold ${
                    tx.transaction_type === "sale" ? "text-green-600" : "text-red-600"
                  }`}>
                    {tx.transaction_type === "sale" ? "+" : "-"}₦{parseFloat(tx.amount).toLocaleString()}
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