// Single-device session enforcement (one active device per account at a time).
// Newest-wins: a new device takes over; the previous device loses access on its
// next heartbeat. FAIL-OPEN: any error grants access so a bug never locks out a
// paying customer.
//
// POST { userId, deviceId, action: "claim" | "heartbeat" | "release" }
//   claim     → register this device as the active one (takes over any other)
//   heartbeat → keep the lock alive; tells caller if it's still the active device
//   release   → clear the lock if this device holds it (on sign-out)
//
// Returns { ok, active } where active=false means another device took over.

var LOCK_TTL = 150; // seconds — lock auto-expires if no heartbeat (stale device)

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://mixcheckai.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ ok: true, active: true });

  var body = req.body || {};
  var userId = (body.userId || "").trim();
  var deviceId = (body.deviceId || "").trim();
  var action = (body.action || "claim").trim();

  // No account or no KV → nothing to enforce; fail open.
  var KV_URL = process.env.KV_REST_API_URL;
  var KV_TOKEN = process.env.KV_REST_API_TOKEN;
  if (!userId || !deviceId || !KV_URL || !KV_TOKEN) {
    return res.status(200).json({ ok: true, active: true });
  }

  var kv = async function(cmd) {
    var r = await fetch(KV_URL, {
      method: "POST",
      headers: { "Authorization": "Bearer " + KV_TOKEN, "Content-Type": "application/json" },
      body: JSON.stringify(cmd),
    });
    return r.json();
  };

  var key = "session_lock:" + userId;

  try {
    if (action === "release") {
      var cur = await kv(["GET", key]);
      var held = parseLock(cur.result);
      if (held && held.deviceId === deviceId) {
        await kv(["DEL", key]);
      }
      return res.status(200).json({ ok: true, active: true });
    }

    var existing = await kv(["GET", key]);
    var lock = parseLock(existing.result);

    if (action === "heartbeat") {
      // Still ours? refresh. Taken over? tell caller it's no longer active.
      if (!lock || lock.deviceId === deviceId) {
        await kv(["SET", key, JSON.stringify({ deviceId: deviceId, lastSeen: Date.now() }), "EX", LOCK_TTL]);
        return res.status(200).json({ ok: true, active: true });
      }
      return res.status(200).json({ ok: true, active: false, activeDevice: lock.deviceId });
    }

    // action === "claim": newest device wins — always take the lock.
    var tookOver = !!(lock && lock.deviceId !== deviceId);
    await kv(["SET", key, JSON.stringify({ deviceId: deviceId, lastSeen: Date.now() }), "EX", LOCK_TTL]);
    return res.status(200).json({ ok: true, active: true, tookOver: tookOver });

  } catch (e) {
    // FAIL OPEN — never block a paying customer because of an infra hiccup.
    return res.status(200).json({ ok: true, active: true });
  }
}

function parseLock(raw) {
  if (!raw) return null;
  try {
    var d = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (d && d.deviceId) return d;
  } catch (e) {}
  return null;
}
