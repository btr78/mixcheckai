// Shared server-side auth helper.
//
// NOT a serverless function — it lives outside /api, so Vercel does not count it
// against the 12-function Hobby limit. It is bundled into any function that imports it.
//
// verifiedUserId(req) validates the Clerk session token from the Authorization
// header and returns the authenticated userId (the JWT `sub` claim), or null.
// It NEVER throws and returns null whenever it can't prove identity (no token,
// CLERK_SECRET_KEY unset, invalid/expired token). Callers treat null as
// "unverified" and fall back to their existing behavior — so nothing breaks
// before CLERK_SECRET_KEY is configured; it only hardens once it is.

import { verifyToken } from "@clerk/backend";

export async function verifiedUserId(req) {
  try {
    var authHeader = req.headers["authorization"] || req.headers["Authorization"] || "";
    var m = /^Bearer\s+(.+)$/i.exec(String(authHeader).trim());
    if (!m) return null;

    var secret = process.env.CLERK_SECRET_KEY;
    if (!secret) return null; // not configured yet → treat as unverified

    var res = await verifyToken(m[1], { secretKey: secret });
    // @clerk/backend v3 returns { data, errors }; older/legacy-wrapped returns the
    // payload directly (and throws on failure, caught below). Handle both.
    if (res && res.errors) return null;
    var payload = res && res.data ? res.data : res;
    return payload && payload.sub ? payload.sub : null;
  } catch (e) {
    return null;
  }
}

// For endpoints that act on a specific account's data. Sends 401 and returns null
// when identity can't be proven, so a caller can never name someone else's userId.
export async function requireUserId(req, res) {
  var id = await verifiedUserId(req);
  if (!id) {
    res.status(401).json({ error: "Sign in required" });
    return null;
  }
  return id;
}

// Caller IP, used to key quotas for anonymous callers. Client-supplied ids
// (userId/deviceId) are rotatable, so they must never be the only quota key.
export function callerIp(req) {
  var xff = req.headers["x-forwarded-for"];
  if (xff) return String(xff).split(",")[0].trim();
  return req.headers["x-real-ip"] || "unknown";
}
