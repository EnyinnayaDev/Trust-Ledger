import { useEffect, useState } from "react";
import { api, type TraderProfile } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export function LenderDashboard() {
  const [recentSearches, setRecentSearches] = useState<TraderProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const results = await api.searchTraders(query);
      setRecentSearches(results);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (score: number) =>
    score >= 700 ? "text-green-600" : score >= 550 ? "text-yellow-600" : "text-red-600";

  const scoreLabel = (score: number) =>
    score >= 700 ? "Low Risk" : score >= 550 ? "Medium Risk" : "High Risk";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lender Dashboard</h1>
        <p className="text-muted-foreground">Search and evaluate traders before lending</p>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Traders</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              placeholder="Search by name, phone, or market..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {recentSearches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Results ({recentSearches.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSearches.map((trader) => (
                <div key={trader.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">Trader #{trader.id}</p>
                    <p className="text-sm text-muted-foreground">{trader.market_name} · {trader.state}</p>
                    <p className="text-sm text-muted-foreground">{trader.phone_number}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-3xl font-bold ${scoreColor(trader.trust_score)}`}>
                      {trader.trust_score}
                    </p>
                    <p className="text-xs text-muted-foreground">out of 850</p>
                    <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      trader.trust_score >= 700 ? "bg-green-100 text-green-700" :
                      trader.trust_score >= 550 ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {scoreLabel(trader.trust_score)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}