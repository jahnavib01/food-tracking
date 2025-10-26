import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { signup, login, me } from "./routes/auth";
import { requireAuth } from "./middleware/auth";
import {
  listItems,
  createItem,
  updateItem,
  deleteItem,
  getStats,
  exportCsv,
} from "./routes/inventory";
import { suggestRecipes } from "./routes/recipes";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health & demo
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });
  app.get("/api/demo", handleDemo);

  // Auth
  app.post("/api/auth/signup", signup);
  app.post("/api/auth/login", login);
  app.get("/api/auth/me", requireAuth, me);

  // Inventory
  app.get("/api/inventory", requireAuth, listItems);
  app.post("/api/inventory", requireAuth, createItem);
  app.put("/api/inventory/:id", requireAuth, updateItem);
  app.delete("/api/inventory/:id", requireAuth, deleteItem);
  app.get("/api/inventory/stats", requireAuth, getStats);
  app.get("/api/inventory/export", requireAuth, exportCsv);

  // Recipes
  app.get("/api/recipes/suggest", requireAuth, suggestRecipes);

  return app;
}
