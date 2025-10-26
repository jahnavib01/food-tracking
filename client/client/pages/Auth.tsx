import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return false;
    }
    return true;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      if (mode === "login") {
        await login({ email, password });
      } else {
        await signup({ email, password });
      }
      navigate("/");
    } catch (err: any) {
      const msg = err?.message || "Something went wrong";
      // If account exists, suggest login and switch mode
      if (msg.toLowerCase().includes("user already exists") || msg.toLowerCase().includes("already exists")) {
        setError("An account with that email already exists. Please log in instead.");
        setMode("login");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">{mode === "login" ? "Welcome back" : "Create an account"}</h1>
        <p className="text-muted-foreground">Sign in to manage your smart pantry.</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4 rounded-lg border bg-card p-6 shadow-sm">
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="email">Email</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="password">Password</label>
          <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">{loading ? "Please wait..." : mode === "login" ? "Log in" : "Sign up"}</Button>
      </form>
      <div className="mt-4 text-center text-sm text-muted-foreground">
        {mode === "login" ? (
          <button onClick={() => setMode("signup")} className="underline underline-offset-4">Need an account? Sign up</button>
        ) : (
          <button onClick={() => setMode("login")} className="underline underline-offset-4">Have an account? Log in</button>
        )}
      </div>
    </div>
  );
}
