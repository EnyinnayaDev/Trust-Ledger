import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, ArrowRight } from "@phosphor-icons/react";
import { api } from "@/lib/api";
import type { Role } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

export function SignupPage() {
  const [role, setRole] = useState<"trader" | "lender">("trader");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    phone_number: "",
    market_name: "",
    state: "",
    institution_name: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.signup({
        username: form.username,
        email: form.email,
        password: form.password,
        role,
        ...(role === "trader"
          ? {
              phone_number: form.phone_number,
              market_name: form.market_name,
              state: form.state,
            }
          : {
              institution_name: form.institution_name,
            }),
      });
      toast.success("Account created! Please sign in.");
      navigate("/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Shield className="h-9 w-9 text-primary" weight="fill" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Create your account
          </CardTitle>
          <CardDescription>
            Join TrustLedger and build your credit history
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Role selector */}
            <div className="space-y-2">
              <Label>I am a</Label>
              <div className="grid grid-cols-2 gap-2">
                {(["trader", "lender"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-all ${
                      role === r
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Common fields */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                placeholder="Choose a username"
                value={form.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            {/* Trader-specific fields */}
            {role === "trader" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    name="phone_number"
                    placeholder="08012345678"
                    value={form.phone_number}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="market_name">Market / Business Name</Label>
                  <Input
                    id="market_name"
                    name="market_name"
                    placeholder="e.g. Tejuosho Market"
                    value={form.market_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    placeholder="e.g. Lagos"
                    value={form.state}
                    onChange={handleChange}
                    required
                  />
                </div>
              </>
            )}

            {/* Lender-specific fields */}
            {role === "lender" && (
              <div className="space-y-2">
                <Label htmlFor="institution_name">Institution Name</Label>
                <Input
                  id="institution_name"
                  name="institution_name"
                  placeholder="e.g. QuickCredit MFI"
                  value={form.institution_name}
                  onChange={handleChange}
                  required
                />
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full gap-2" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <a href="/login" className="text-primary font-medium hover:underline">
                Sign in
              </a>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}