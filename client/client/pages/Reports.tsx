import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import type { InventoryStats } from "@shared/api";

export default function ReportsPage() {
  const { user, authFetch } = useAuth();
  const [stats, setStats] = useState<InventoryStats | null>(null);

  const load = async () => {
    if (!user) return;
    const r = await authFetch('/api/inventory/stats');
    const body = await r.json().catch(()=>null);
    if (r.ok && body) setStats(body as InventoryStats);
  };

  useEffect(()=>{ load(); }, [user]);

  const exportCsv = async () => {
    const r = await authFetch('/api/inventory/export');
    if (!r.ok) return alert('Export failed');
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'inventory.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };

  if (!user) return (
    <AppLayout>
      <div className="mx-auto max-w-2xl text-center py-12">
        <h2 className="text-3xl font-bold">Reports & Analytics</h2>
        <p className="mt-2 text-muted-foreground">Sign in to view your inventory reports and analytics.</p>
        <div className="mt-6"><a href="/auth" className="rounded-md bg-primary px-4 py-2 text-primary-foreground">Sign in / Sign up</a></div>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl">
        <h2 className="text-2xl font-bold">Reports & Analytics</h2>
        <p className="text-muted-foreground">Download inventory reports and view key metrics.</p>
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="rounded-xl border bg-card p-4 text-center">
            <div className="text-sm text-muted-foreground">Total items</div>
            <div className="mt-2 text-2xl font-bold">{stats?.total ?? 0}</div>
          </div>
          <div className="rounded-xl border bg-card p-4 text-center">
            <div className="text-sm text-muted-foreground">Expired</div>
            <div className="mt-2 text-2xl font-bold">{stats?.expired ?? 0}</div>
          </div>
          <div className="rounded-xl border bg-card p-4 text-center">
            <div className="text-sm text-muted-foreground">Expiring soon</div>
            <div className="mt-2 text-2xl font-bold">{stats?.expiringSoon ?? 0}</div>
          </div>
        </div>
        <div className="mt-6"><Button onClick={exportCsv}>Export CSV</Button></div>
      </div>
    </AppLayout>
  );
}
