import React, { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import type { InventoryItem, InventoryListResponse, InventoryStats, RecipesSuggestionResponse } from "@shared/api";

function StatCard({ title, value, tone }: { title: string; value: number | string; tone?: "ok" | "warn" | "error" }) {
  const toneClasses = tone === "error" ? "from-red-500 to-rose-500" : tone === "warn" ? "from-amber-500 to-yellow-500" : "from-emerald-500 to-lime-500";
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{title}</p>
        <span className={`h-2 w-2 rounded-full bg-gradient-to-br ${toneClasses}`} />
      </div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
    </div>
  );
}

function daysUntil(dateIso: string) {
  const now = new Date();
  const d = new Date(dateIso);
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function ExpiringSoon({ items }: { items: InventoryItem[] }) {
  const soon = items.filter((i) => {
    const diff = daysUntil(i.expiry);
    return diff >= 0 && diff <= 3;
  });
  if (soon.length === 0) return null;
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <h3 className="font-semibold">Expiring soon</h3>
      <ul className="mt-3 space-y-2">
        {soon.slice(0, 6).map((i) => (
          <li key={i.id} className="flex items-center justify-between text-sm">
            <span>{i.name} <span className="text-muted-foreground">({i.category})</span></span>
            <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-amber-700 dark:text-amber-300">{daysUntil(i.expiry)}d</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Index() {
  const { user, authFetch } = useAuth();
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [recipes, setRecipes] = useState<RecipesSuggestionResponse["recipes"]>([]);
  const [form, setForm] = useState({ name: "", quantity: 1, unit: "", category: "Other", expiry: new Date(Date.now() + 3*24*3600*1000).toISOString().slice(0,10) });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!user) return;
    const s = await authFetch("/api/inventory/stats");
    if (s.ok) setStats(await s.json());
    const r = await authFetch("/api/inventory");
    if (r.ok) setItems(((await r.json()) as InventoryListResponse).items);
    const ings = [...new Set(items.map(i => i.name.toLowerCase()))].slice(0, 5).join(",");
    const rec = await authFetch(`/api/recipes/suggest?ingredients=${encodeURIComponent(ings)}`);
    if (rec.ok) setRecipes(((await rec.json()) as RecipesSuggestionResponse).recipes);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const addItem = async () => {
    setLoading(true);
    const res = await authFetch("/api/inventory", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, expiry: new Date(form.expiry).toISOString() }) });
    setLoading(false);
    if (res.ok) {
      setForm({ name: "", quantity: 1, unit: "", category: "Other", expiry: new Date().toISOString().slice(0,10) });
      await load();
    }
  };

  const removeItem = async (id: string) => {
    const res = await authFetch(`/api/inventory/${id}`, { method: "DELETE" });
    if (res.ok) await load();
  };

  const exportCsv = async () => {
    const r = await authFetch("/api/inventory/export");
    if (!r.ok) return;
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  if (!user) {
    return (
      <AppLayout>
        <section className="grid gap-8 md:grid-cols-2 items-center">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Smart Food Inventory Management</h1>
            <p className="mt-3 text-muted-foreground">Reduce waste, plan meals, and keep track of what you have. Secure accounts, expiry alerts, recipe ideas, barcode scanning, and exports.</p>
            <ul className="mt-4 grid gap-2 text-sm text-muted-foreground">
              <li>• Secure login with JWT</li>
              <li>• Auto-sorted inventory by expiry</li>
              <li>• Alerts for items expiring soon</li>
              <li>• Recipe suggestions from your ingredients</li>
              <li>• CSV export and analytics</li>
            </ul>
            <div className="mt-6"><a href="/auth" className="inline-flex items-center rounded-md bg-gradient-to-br from-emerald-500 to-lime-500 px-5 py-3 font-medium text-white shadow hover:opacity-95">Get started</a></div>
          </div>
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h3 className="font-semibold">Live preview</h3>
            <p className="text-sm text-muted-foreground">Sign in to add items and see personalized data.</p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <StatCard title="Total items" value={12} />
              <StatCard title="Expired" value={1} tone="error" />
              <StatCard title="Expiring soon" value={3} tone="warn" />
            </div>
            <div className="mt-4 rounded-lg border p-3 text-sm">No expiring alerts in preview.</div>
          </div>
        </section>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total items" value={stats?.total ?? 0} />
        <StatCard title="Expired" value={stats?.expired ?? 0} tone="error" />
        <StatCard title="Expiring soon" value={stats?.expiringSoon ?? 0} tone="warn" />
      </section>

      <section className="mt-6 grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <div className="rounded-xl border bg-card p-4 shadow-sm">
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
              <BarcodeButton />
            </div>
          </div>

          <div className="rounded-xl border bg-card p-4 shadow-sm">
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
        <div className="space-y-4">
          <ExpiringSoon items={items} />
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <h3 className="font-semibold">Recipe suggestions</h3>
            <ul className="mt-3 space-y-3">
              {recipes.map((r, idx) => (
                <li key={idx} className="rounded-lg border p-3">
                  <a href={r.url} target="_blank" className="font-medium hover:underline">{r.title}</a>
                  <p className="text-xs text-muted-foreground">{r.ingredients.join(", ")}</p>
                </li>
              ))}
              {recipes.length===0 && <li className="text-sm text-muted-foreground">No suggestions yet.</li>}
            </ul>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}

function BarcodeButton() {
  const [active, setActive] = useState(false);
  const [supported, setSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoId = "barcode-video";
  useEffect(()=>{ setSupported(typeof (window as any).BarcodeDetector !== 'undefined'); },[]);
  useEffect(()=>{
    let stream: MediaStream | null = null;
    let raf = 0;
    let detector: any = null as any;
    async function start() {
      try {
        // @ts-ignore
        detector = new (window as any).BarcodeDetector({ formats: ["ean_13","upc_a","qr_code","code_128"] });
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
        const video = document.getElementById(videoId) as HTMLVideoElement | null;
        if (video) {
          video.srcObject = stream;
          await video.play();
          loop(video);
        }
      } catch (e: any) {
        setError(e?.message || "Failed to access camera");
      }
    }
    async function loop(video: HTMLVideoElement) {
      try {
        const detections = await detector.detect(video);
        if (detections && detections[0]) {
          const code = detections[0].rawValue as string;
          alert(`Scanned: ${code}`);
          // Could fetch product details via API here
          stop();
          return;
        }
      } catch {}
      raf = requestAnimationFrame(()=> loop(video));
    }
    function stop() {
      if (raf) cancelAnimationFrame(raf);
      if (stream) stream.getTracks().forEach(t=>t.stop());
      stream = null;
      setActive(false);
    }
    if (active) start();
    return () => { if (stream) stream.getTracks().forEach(t=>t.stop()); if (raf) cancelAnimationFrame(raf); };
  }, [active]);

  if (!supported) return null;
  return (
    <>
      <button onClick={()=>setActive(true)} className="rounded-md border px-3 py-2 text-sm hover:bg-accent">Scan barcode</button>
      {active && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-6">
          <div className="w-full max-w-md rounded-xl border bg-card p-4 shadow">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Scan a barcode</h4>
              <button onClick={()=>setActive(false)} className="rounded-md border px-2 py-1 text-sm">Close</button>
            </div>
            {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
            <video id={videoId} className="mt-3 aspect-video w-full rounded-md bg-black/60" muted playsInline></video>
            <p className="mt-2 text-xs text-muted-foreground">Point your camera at a barcode. It will auto-detect.</p>
          </div>
        </div>
      )}
    </>
  );
}
