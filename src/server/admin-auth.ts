import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "admin_session";
export const ADMIN_SESSION_SECONDS = 12 * 60 * 60;

/** The configured admin password: `ADMIN_PASSWORD`, falling back to the legacy `PASSWORD`. */
export function getAdminPassword(): string | null {
  const p = process.env.ADMIN_PASSWORD || process.env.PASSWORD;
  return p ? p : null;
}

export function isAdminConfigured(): boolean {
  return getAdminPassword() !== null;
}

function sha256(v: string): Buffer {
  return createHash("sha256").update(v).digest();
}

/** Constant-time password check (compares fixed-length hashes). */
export function checkPassword(candidate: string): boolean {
  const pw = getAdminPassword();
  if (!pw) return false;
  return timingSafeEqual(sha256(candidate), sha256(pw));
}

function sign(payload: string): string | null {
  const pw = getAdminPassword();
  if (!pw) return null;
  const key = process.env.ADMIN_SESSION_SECRET || sha256(`admin-session:${pw}`);
  return createHmac("sha256", key).update(payload).digest("base64url");
}

/** Signed token: `<expiry ms>.<HMAC-SHA256>`. */
export function createSessionToken(): string | null {
  const exp = String(Date.now() + ADMIN_SESSION_SECONDS * 1000);
  const sig = sign(exp);
  return sig ? `${exp}.${sig}` : null;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || !/^\d+$/.test(exp)) return false;
  if (Number(exp) <= Date.now()) return false;
  const expected = sign(exp);
  if (!expected) return false;
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** True when the request carries a valid, unexpired admin session cookie. */
export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  return verifySessionToken(jar.get(ADMIN_COOKIE)?.value);
}
