import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import type { InventoryItem, InventoryListResponse } from "@shared/api";

export default function InventoryPage() {
  const { user, authFetch } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", quantity: 1, unit: "", category: "Other", expiry: new Date().toISOString().slice(0,10) });

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const r = await authFetch('/api/inventory');
      const body = await r.json().catch(()=>null);
      if (r.ok && body) setItems((body as InventoryListResponse).items);
    } finally { setLoading(false); }
  };

  useEffect(()=>{ load(); }, [user]);

  const addItem = async () => {
    if (!user) return alert('Please login first');
    setLoading(true);
    try {
      const r = await authFetch('/api/inventory', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, expiry: new Date(form.expiry).toISOString() }) });
      const body = await r.json().catch(()=>null);
      if (r.ok) { await load(); setForm({ name: "", quantity: 1, unit: "", category: "Other", expiry: new Date().toISOString().slice(0,10) }); }
      else alert(body?.error || 'Failed to add item');
    } finally { setLoading(false); }
  };

  const removeItem = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    const r = await authFetch(`/api/inventory/${id}`, { method: 'DELETE' });
    if (r.ok) await load(); else alert('Failed to delete');
  };

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
        <h2 className="text-3xl font-bold">Inventory</h2>
        <p className="mt-2 text-muted-foreground">Sign in to view and manage your pantry inventory.</p>
        <div className="mt-6"><a href="/auth" className="rounded-md bg-primary px-4 py-2 text-primary-foreground">Sign in / Sign up</a></div>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-bold">Inventory</h2>
        <p className="text-muted-foreground">Add, edit and remove items. Items are sorted by expiry.</p>

        <div className="mt-6 rounded-xl border bg-card p-4 shadow-sm">
          <h3 className="font-semibold">Add item</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <input placeholder="Name" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} className="rounded-md border bg-background px-3 py-2" />
            <input placeholder="Qty" type="number" value={form.quantity} onChange={(e)=>setForm({...form, quantity:Number(e.target.value)})} className="rounded-md border bg-background px-3 py-2" />
            <input placeholder="Unit" value={form.unit} onChange={(e)=>setForm({...form, unit:e.target.value})} className="rounded-md border bg-background px-3 py-2" />
            <select value={form.category} onChange={(e)=>setForm({...form, category:e.target.value})} className="rounded-md border bg-background px-3 py-2">
              {['Dairy','Vegetables','Fruits','Meat','Seafood','Grains','Snacks','Beverages','Bakery','Frozen','Other'].map(c=> <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="date" value={form.expiry} onChange={(e)=>setForm({...form, expiry:e.target.value})} className="rounded-md border bg-background px-3 py-2" />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Button onClick={addItem} disabled={loading}>{loading ? 'Adding...' : 'Add'}</Button>
            <Button variant="outline" onClick={exportCsv}>Export CSV</Button>
          </div>
        </div>

        <div className="mt-6 rounded-xl border bg-card p-4 shadow-sm">
          <h3 className="font-semibold">Inventory</h3>
          <div className="mt-3 overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr>
                  <th className="py-2 pr-3">Item</th>
                  <th className="py-2 pr-3">Qty</th>
                  <th className="py-2 pr-3">Expiry</th>
                  <th className="py-2 pr-3">Category</th>
                  <th className="py-2 pr-3"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.id} className="border-t">
                    <td className="py-2 pr-3">{i.name}</td>
                    <td className="py-2 pr-3">{i.quantity} {i.unit}</td>
                    <td className="py-2 pr-3">{new Date(i.expiry).toLocaleDateString()}</td>
                    <td className="py-2 pr-3">{i.category}</td>
                    <td className="py-2 text-right"><button onClick={()=>removeItem(i.id)} className="rounded-md border px-3 py-1 text-sm hover:bg-accent">Delete</button></td>
                  </tr>
                ))}
                {items.length===0 && (
                  <tr><td className="py-6 text-muted-foreground" colSpan={5}>No items yet. Add your first item above.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
