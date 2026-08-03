import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = "session";
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
const REMEMBER_ME_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

if (!JWT_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET environment variable is required in production");
}

export type SessionPayload = {
  userId: number;
  role: "customer" | "admin" | "tailor";
};

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signSession(payload: SessionPayload, ttlSeconds: number = TOKEN_TTL_SECONDS) {
  return jwt.sign(payload, JWT_SECRET ?? "dev-only-secret", {
    expiresIn: ttlSeconds,
  });
}

export function verifySession(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET ?? "dev-only-secret") as SessionPayload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(payload: SessionPayload, options?: { rememberMe?: boolean }) {
  const rememberMe = options?.rememberMe ?? false;
  const ttlSeconds = rememberMe ? REMEMBER_ME_TTL_SECONDS : TOKEN_TTL_SECONDS;
  const token = signSession(payload, ttlSeconds);
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    // No maxAge => browser-session cookie, cleared on close, unless the user opted into "remember me".
    ...(rememberMe ? { maxAge: ttlSeconds } : {}),
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function requireAdmin(): Promise<SessionPayload | null> {
  const session = await getSession();
  if (!session || session.role !== "admin") return null;
  return session;
}

export async function requireTailor(): Promise<SessionPayload | null> {
  const session = await getSession();
  if (!session || session.role !== "tailor") return null;
  return session;
}

/** Admin or tailor — used for endpoints tailors are allowed to use (stitch orders). */
export async function requireStaff(): Promise<SessionPayload | null> {
  const session = await getSession();
  if (!session || (session.role !== "admin" && session.role !== "tailor")) return null;
  return session;
}

export { COOKIE_NAME };
