import { RequestHandler } from "express";
import crypto from "crypto";
import { signJWT } from "../middleware/auth";
import type { AuthLoginRequest, AuthResponse, AuthSignupRequest, User } from "@shared/api";

interface StoredUser {
  id: string;
  email: string;
  role: "user" | "admin";
  passwordHash: string;
  salt: string;
  createdAt: string;
}

const users = new Map<string, StoredUser>();

function hashPassword(password: string, salt?: string) {
  const s = salt || crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, s, 100000, 64, "sha512").toString("hex");
  return { hash, salt: s };
}

export const signup: RequestHandler = (req, res) => {
  const body = req.body as AuthSignupRequest;
  const email = (body.email || "").toLowerCase().trim();
  const password = body.password || "";
  const role = body.role || "user";
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });
  if (users.has(email)) return res.status(409).json({ error: "User already exists" });
  const { hash, salt } = hashPassword(password);
  const id = crypto.randomUUID();
  const user: StoredUser = {
    id,
    email,
    role,
    passwordHash: hash,
    salt,
    createdAt: new Date().toISOString(),
  };
  users.set(email, user);
  const token = signJWT({ sub: id, email, role });
  const publicUser: User = { id, email, role };
  const resp: AuthResponse = { token, user: publicUser };
  res.status(201).json(resp);
};

export const login: RequestHandler = (req, res) => {
  const body = req.body as AuthLoginRequest;
  const email = (body.email || "").toLowerCase().trim();
  const password = body.password || "";
  const user = users.get(email);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const { hash } = hashPassword(password, user.salt);
  if (hash !== user.passwordHash) return res.status(401).json({ error: "Invalid credentials" });
  const token = signJWT({ sub: user.id, email: user.email, role: user.role });
  const publicUser: User = { id: user.id, email: user.email, role: user.role };
  const resp: AuthResponse = { token, user: publicUser };
  res.json(resp);
};

export const me: RequestHandler = (req, res) => {
  // @ts-ignore
  const u = req.user as User | undefined;
  if (!u) return res.status(401).json({ error: "Unauthorized" });
  res.json(u);
};

export function __debug_getUsers() {
  return users;
}
