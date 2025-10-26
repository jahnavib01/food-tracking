import { RequestHandler } from "express";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

type JWTPayload = {
  sub: string; // userId
  email: string;
  role: "user" | "admin";
  iat: number;
  exp: number;
};

function base64url(input: Buffer | string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export function signJWT(payload: Omit<JWTPayload, "iat" | "exp">, ttlSec = 60 * 60 * 24 * 7) {
  const header = { alg: "HS256", typ: "JWT" };
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + ttlSec;
  const fullPayload: JWTPayload = { ...payload, iat, exp } as JWTPayload;
  const headerPart = base64url(JSON.stringify(header));
  const payloadPart = base64url(JSON.stringify(fullPayload));
  const data = `${headerPart}.${payloadPart}`;
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(data)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return `${data}.${signature}`;
}

export function verifyJWT(token: string): JWTPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [headerPart, payloadPart, signature] = parts;
  const data = `${headerPart}.${payloadPart}`;
  const expectedSig = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(data)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  if (signature !== expectedSig) return null;
  try {
    const payload: JWTPayload = JSON.parse(Buffer.from(payloadPart, "base64").toString());
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export const requireAuth: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  const payload = verifyJWT(token);
  if (!payload) return res.status(401).json({ error: "Invalid token" });
  // @ts-ignore
  req.user = { id: payload.sub, email: payload.email, role: payload.role };
  next();
};
