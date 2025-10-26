import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import type { RecipesSuggestionResponse, InventoryListResponse } from "@shared/api";

export default function RecipesPage() {
  const { user, authFetch } = useAuth();
  const [recipes, setRecipes] = useState<RecipesSuggestionResponse["recipes"]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const r1 = await authFetch('/api/inventory');
      const body1 = await r1.json().catch(()=>null);
      const items = r1.ok && body1 ? (body1 as InventoryListResponse).items : [];
      const ings = [...new Set(items.map(i=>i.name.toLowerCase()))].slice(0,6).join(',');
      const r2 = await authFetch(`/api/recipes/suggest?ingredients=${encodeURIComponent(ings)}`);
      const body2 = await r2.json().catch(()=>null);
      if (r2.ok && body2) setRecipes((body2 as RecipesSuggestionResponse).recipes);
    } finally { setLoading(false); }
  };

  useEffect(()=>{ load(); }, [user]);

  if (!user) return (
    <AppLayout>
      <div className="mx-auto max-w-2xl text-center py-12">
        <h2 className="text-3xl font-bold">Recipes</h2>
        <p className="mt-2 text-muted-foreground">Sign in to get recipe suggestions based on your pantry items.</p>
        <div className="mt-6"><a href="/auth" className="rounded-md bg-primary px-4 py-2 text-primary-foreground">Sign in / Sign up</a></div>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl">
        <h2 className="text-2xl font-bold">Recipes</h2>
        <p className="text-muted-foreground">Discover recipes based on ingredients you have.</p>
        <div className="mt-6 grid gap-4">
          {loading && <div className="text-sm text-muted-foreground">Loading suggestions...</div>}
          {recipes.map((r, idx) => (
            <div key={idx} className="rounded-xl border bg-card p-4 shadow-sm">
              <a href={r.url} target="_blank" className="font-medium hover:underline">{r.title}</a>
              <p className="text-xs text-muted-foreground mt-1">{r.ingredients.join(', ')}</p>
            </div>
          ))}
          {recipes.length===0 && !loading && <div className="text-sm text-muted-foreground">No suggestions yet. Add items to your inventory to get personalized recipes.</div>}
        </div>
      </div>
    </AppLayout>
  );
}
