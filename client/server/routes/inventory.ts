import { RequestHandler } from "express";
import crypto from "crypto";
import type {
  InventoryCreateRequest,
  InventoryItem,
  InventoryListResponse,
  InventoryStats,
  InventoryUpdateRequest,
} from "@shared/api";

// In-memory store: userId -> items map
const store = new Map<string, Map<string, InventoryItem>>();

function getUserStore(userId: string) {
  if (!store.has(userId)) store.set(userId, new Map());
  return store.get(userId)!;
}

export const listItems: RequestHandler = (req, res) => {
  // @ts-ignore
  const user = req.user as { id: string };
  const items = Array.from(getUserStore(user.id).values()).sort(
    (a, b) => new Date(a.expiry).getTime() - new Date(b.expiry).getTime(),
  );
  const resp: InventoryListResponse = { items };
  res.json(resp);
};

export const createItem: RequestHandler = (req, res) => {
  // @ts-ignore
  const user = req.user as { id: string };
  const body = req.body as InventoryCreateRequest;
  if (!body.name || !body.quantity || !body.expiry || !body.category) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const item: InventoryItem = {
    id,
    userId: user.id,
    name: body.name.trim(),
    quantity: Number(body.quantity),
    unit: body.unit,
    expiry: new Date(body.expiry).toISOString(),
    category: body.category,
    barcode: body.barcode,
    notes: body.notes,
    createdAt: now,
    updatedAt: now,
  };
  getUserStore(user.id).set(id, item);
  res.status(201).json(item);
};

export const updateItem: RequestHandler = (req, res) => {
  // @ts-ignore
  const user = req.user as { id: string };
  const id = req.params.id;
  const body = req.body as InventoryUpdateRequest;
  const userItems = getUserStore(user.id);
  const item = userItems.get(id);
  if (!item) return res.status(404).json({ error: "Item not found" });
  const updated: InventoryItem = {
    ...item,
    ...body,
    quantity: body.quantity !== undefined ? Number(body.quantity) : item.quantity,
    expiry: body.expiry ? new Date(body.expiry).toISOString() : item.expiry,
    updatedAt: new Date().toISOString(),
  };
  userItems.set(id, updated);
  res.json(updated);
};

export const deleteItem: RequestHandler = (req, res) => {
  // @ts-ignore
  const user = req.user as { id: string };
  const id = req.params.id;
  const userItems = getUserStore(user.id);
  if (!userItems.has(id)) return res.status(404).json({ error: "Item not found" });
  userItems.delete(id);
  res.status(204).end();
};

export const getStats: RequestHandler = (req, res) => {
  // @ts-ignore
  const user = req.user as { id: string };
  const items = Array.from(getUserStore(user.id).values());
  const now = new Date();
  const soonThresholdDays = Number(process.env.EXPIRY_SOON_DAYS || 3);
  let expired = 0;
  let expiringSoon = 0;
  const categoriesCount: Record<string, number> = {};
  for (const it of items) {
    const d = new Date(it.expiry);
    if (d.getTime() < now.getTime()) expired++;
    const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays >= 0 && diffDays <= soonThresholdDays) expiringSoon++;
    categoriesCount[it.category] = (categoriesCount[it.category] || 0) + 1;
  }
  const stats: InventoryStats = {
    total: items.length,
    expired,
    expiringSoon,
    categoriesCount,
  };
  res.json(stats);
};

export const exportCsv: RequestHandler = (req, res) => {
  // @ts-ignore
  const user = req.user as { id: string };
  const items = Array.from(getUserStore(user.id).values());
  const headers = [
    "id",
    "name",
    "quantity",
    "unit",
    "expiry",
    "category",
    "barcode",
    "notes",
    "createdAt",
    "updatedAt",
  ];
  const rows = [headers.join(",")].concat(
    items.map((i) =>
      [
        i.id,
        escapeCsv(i.name),
        i.quantity,
        i.unit || "",
        i.expiry,
        i.category,
        i.barcode || "",
        escapeCsv(i.notes || ""),
        i.createdAt,
        i.updatedAt,
      ].join(","),
    ),
  );
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=inventory.csv`);
  res.send(rows.join("\n"));
};

function escapeCsv(v: string) {
  if (v.includes(",") || v.includes("\n") || v.includes('"')) {
    return '"' + v.replace(/"/g, '""') + '"';
  }
  return v;
}
