// GET  /api/check-pro?userId=xxx        → cloud Pro status for a Clerk user
// POST /api/check-pro { action, ... }    → single-device session enforcement
//        action: "claim" | "heartbeat" | "release"  (userId, deviceId)
//        action: "seed"  (key, code, days)  — TEMP guarded seeder, remove after use
//
// Single-device: newest device wins; previous device loses access on next heartbeat.
// FAIL-OPEN: any error returns active:true so a bug never locks out a paying customer.

var LOCK_TTL = 150; // seconds

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://mixcheckai.com");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  var KV_URL = process.env.KV_REST_API_URL;
  var KV_TOKEN = process.env.KV_REST_API_TOKEN;
  var kv = async function (cmd) {
    var r = await fetch(KV_URL, {
      method: "POST",
      headers: { "Authorization": "Bearer " + KV_TOKEN, "Content-Type": "application/json" },
      body: JSON.stringify(cmd),
    });
    return r.json();
  };

  // ── POST: session enforcement ───────────────────────────────────────────────
  if (req.method === "POST") {
    var body = req.body || {};
    var action = (body.action || "claim").trim();
    var userId = (body.userId || "").trim();
    var deviceId = (body.deviceId || "").trim();
    if (!userId || !deviceId || !KV_URL || !KV_TOKEN) return res.status(200).json({ ok: true, active: true });

    var key = "session_lock:" + userId;
    try {
      if (action === "release") {
        var cur = await kv(["GET", key]);
        var held = null; try { held = cur.result ? JSON.parse(cur.result) : null; } catch (e) {}
        if (held && held.deviceId === deviceId) await kv(["DEL", key]);
        return res.status(200).json({ ok: true, active: true });
      }
      var existing = await kv(["GET", key]);
      var lock = null; try { lock = existing.result ? JSON.parse(existing.result) : null; } catch (e) {}
      if (action === "heartbeat") {
        if (!lock || lock.deviceId === deviceId) {
          await kv(["SET", key, JSON.stringify({ deviceId: deviceId, lastSeen: Date.now() }), "EX", LOCK_TTL]);
          return res.status(200).json({ ok: true, active: true });
        }
        return res.status(200).json({ ok: true, active: false });
      }
      // claim: newest device wins
      await kv(["SET", key, JSON.stringify({ deviceId: deviceId, lastSeen: Date.now() }), "EX", LOCK_TTL]);
      return res.status(200).json({ ok: true, active: true });
    } catch (e) {
      return res.status(200).json({ ok: true, active: true }); // fail open
    }
  }

  // ── GET: Pro status ─────────────────────────────────────────────────────────
  var qUserId = (req.query.userId || "").trim();
  if (!qUserId) return res.status(400).json({ error: "Missing userId" });
  if (!KV_URL || !KV_TOKEN) return res.status(200).json({ isPro: false });

  try {
    var r = await kv(["GET", "user_pro:" + qUserId]);
    if (!r.result) return res.status(200).json({ isPro: false });
    var data = {};
    try { data = JSON.parse(r.result); } catch (e) {}
    return res.status(200).json({
      isPro: true,
      lifetime: !!data.lifetime,
      activatedAt: data.activatedAt || null,
      code: data.code || null,
    });
  } catch (e) {
    return res.status(200).json({ isPro: false });
  }
}
