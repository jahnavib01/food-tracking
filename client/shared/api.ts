/**
 * Shared types for Smart Food Inventory Management System
 */

export type UserRole = "user" | "admin";

export interface User {
  id: string;
  email: string;
  role: UserRole;
}

export interface ApiError {
  error: string;
}

// Auth
export interface AuthSignupRequest {
  email: string;
  password: string;
  role?: UserRole;
}

export interface AuthLoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Inventory
export type Category =
  | "Dairy"
  | "Vegetables"
  | "Fruits"
  | "Meat"
  | "Seafood"
  | "Grains"
  | "Snacks"
  | "Beverages"
  | "Bakery"
  | "Frozen"
  | "Other";

export interface InventoryItem {
  id: string;
  userId: string;
  name: string;
  quantity: number;
  unit?: string;
  expiry: string; // ISO date string
  category: Category;
  barcode?: string;
  notes?: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface InventoryCreateRequest {
  name: string;
  quantity: number;
  unit?: string;
  expiry: string; // ISO date string
  category: Category;
  barcode?: string;
  notes?: string;
}

export interface InventoryUpdateRequest {
  name?: string;
  quantity?: number;
  unit?: string;
  expiry?: string;
  category?: Category;
  barcode?: string;
  notes?: string;
}

export interface InventoryListResponse {
  items: InventoryItem[];
}

export interface InventoryStats {
  total: number;
  expired: number;
  expiringSoon: number; // within N days
  categoriesCount: Record<string, number>;
}

export interface RecipeSuggestion {
  title: string;
  url: string;
  ingredients: string[];
  image?: string;
}

export interface RecipesSuggestionResponse {
  recipes: RecipeSuggestion[];
}
