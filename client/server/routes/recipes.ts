import { RequestHandler } from "express";
import type { RecipesSuggestionResponse, RecipeSuggestion } from "@shared/api";

const SPOON_API_KEY = process.env.SPOONACULAR_API_KEY || process.env.SPOON_API_KEY;

export const suggestRecipes: RequestHandler = async (req, res) => {
  const ingredientsParam = String(req.query.ingredients || "");
  const ingredients = ingredientsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 10);

  if (SPOON_API_KEY && ingredients.length) {
    try {
      const url = new URL("https://api.spoonacular.com/recipes/findByIngredients");
      url.searchParams.set("ingredients", ingredients.join(","));
      url.searchParams.set("number", "6");
      url.searchParams.set("ranking", "2");
      url.searchParams.set("apiKey", SPOON_API_KEY);
      const r = await fetch(url.toString());
      const data = (await r.json()) as any[];
      const recipes: RecipeSuggestion[] = data.map((d) => ({
        title: d.title,
        url: `https://spoonacular.com/recipes/${encodeURIComponent(d.title)}-${d.id}`,
        ingredients: [
          ...((d.usedIngredients || []).map((i: any) => i.name)),
          ...((d.missedIngredients || []).map((i: any) => i.name)),
        ],
        image: d.image,
      }));
      const resp: RecipesSuggestionResponse = { recipes };
      return res.json(resp);
    } catch (e) {
      // fallback below
    }
  }

  // Fallback: simple ideas based on ingredient keywords
  const base = ingredients.map((i) => i.toLowerCase());
  const suggestions: RecipeSuggestion[] = generateLocalSuggestions(base).slice(0, 6);
  const resp: RecipesSuggestionResponse = { recipes: suggestions };
  res.json(resp);
};

function generateLocalSuggestions(ings: string[]): RecipeSuggestion[] {
  const results: RecipeSuggestion[] = [];
  const has = (k: string) => ings.some((i) => i.includes(k));
  if (has("egg") && has("bread")) results.push({ title: "French Toast", url: "https://www.allrecipes.com/recipe/7016/french-toast-i/", ingredients: ["egg", "bread", "milk"], image: undefined });
  if (has("tomato") && has("pasta")) results.push({ title: "Simple Tomato Pasta", url: "https://www.allrecipes.com/recipe/23431/pasta-with-fresh-tomatoes/", ingredients: ["pasta", "tomato", "garlic"], image: undefined });
  if (has("rice") && has("chicken")) results.push({ title: "Chicken Fried Rice", url: "https://www.allrecipes.com/recipe/79543/chicken-fried-rice/", ingredients: ["rice", "chicken", "egg", "peas"], image: undefined });
  if (has("banana")) results.push({ title: "Banana Smoothie", url: "https://www.allrecipes.com/recipe/221261/banana-banana-strawberry-smoothie/", ingredients: ["banana", "milk", "ice"], image: undefined });
  if (has("potato")) results.push({ title: "Crispy Roasted Potatoes", url: "https://www.allrecipes.com/recipe/240208/ultimate-roasted-potatoes/", ingredients: ["potato", "oil", "salt"], image: undefined });
  if (results.length === 0) results.push({ title: "Mixed Veg Stir-fry", url: "https://www.allrecipes.com/recipe/229960/quick-vegetable-stir-fry/", ingredients: ["vegetables", "soy sauce", "garlic"], image: undefined });
  return results;
}
