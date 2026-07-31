import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Lender } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { motion } from "framer-motion";

export function AdminLenders() {
  const [lenders, setLenders] = useState<Lender[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadLenders();
  }, []);

  const loadLenders = async () => {
    try {
      const lnds = await api.getLenders();
      setLenders(lnds);
    } catch (error) {
      console.error("Failed to load lenders:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = lenders.filter(l => {
    const term = search.toLowerCase();
    return (
      l.institution_name.toLowerCase().includes(term) ||
      String(l.user).includes(term)
    );
  });

  if (loading) {
    return <div className="flex items-center justify-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lenders</h1>
        <p className="text-muted-foreground">Manage all registered lenders</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Lenders</CardTitle>
          <CardDescription>{filtered.length} lenders registered</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search lenders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((lender, i) => (
              <motion.div
                key={lender.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-base">{lender.institution_name}</CardTitle>
                    <CardDescription>User #{lender.user}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Verified</span>
                        <Badge variant="outline" className="text-base font-bold">
                          {lender.is_verified ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Joined</span>
                        <span className="text-sm font-medium">{new Date(lender.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
