import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulated login — will be replaced with real auth
    await new Promise(r => setTimeout(r, 1000));

    if (email === "admin@jamair.com" && password === "admin123") {
      sessionStorage.setItem("jamair_admin", "true");
      toast.success("Welcome back, Admin");
      navigate("/admin/dashboard");
    } else {
      setError("Invalid credentials. Please try again.");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/20 mb-4">
            <Shield className="h-7 w-7 text-accent" />
          </div>
          <h1 className="font-display text-2xl font-bold text-primary-foreground">Admin Access</h1>
          <p className="text-primary-foreground/50 text-sm mt-1">JamAir Tracker Control Panel</p>
        </div>

        <form onSubmit={handleLogin} className="bg-card rounded-xl p-6 shadow-2xl shadow-primary/50 border border-border">
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-card-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@jamair.com"
                required
                className="mt-1.5"
                autoComplete="email"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium text-card-foreground">Password</Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full mt-6 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold" disabled={isLoading}>
            {isLoading ? "Authenticating..." : "Sign In"}
          </Button>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Protected by enterprise-grade security
          </p>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
