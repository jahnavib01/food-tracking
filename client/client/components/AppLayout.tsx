import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const m = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = document.documentElement.classList.contains('dark') || m;
    setDark(isDark);
  }, []);
  return (
    <button
      aria-label="Toggle theme"
      onClick={() => {
        const next = !document.documentElement.classList.toggle('dark');
        setDark(!next);
      }}
      className="rounded-md border px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
    >
      {dark ? 'Light' : 'Dark'}
    </button>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40">
      <header className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-emerald-500 to-lime-500" />
            <span className="font-extrabold tracking-tight text-xl">Smart Pantry</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <NavItem to="/" label="Dashboard" />
            <NavItem to="/inventory" label="Inventory" />
            <NavItem to="/recipes" label="Recipes" />
            <NavItem to="/reports" label="Reports" />
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-sm text-muted-foreground">{user.email}</span>
                <Button variant="outline" onClick={() => { logout(); navigate('/'); }}>Logout</Button>
              </div>
            ) : (
              <Link to="/auth" className="text-sm underline underline-offset-4">Login</Link>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Smart Pantry • Reduce waste. Eat smart.
      </footer>
    </div>
  );
}

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground",
          isActive && "bg-accent text-foreground",
        )
      }
      end
    >
      {label}
    </NavLink>
  );
}
