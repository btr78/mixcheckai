// Pro code activation — server-side validation with device locking
// Master code: env var MASTER_PRO_CODE — lifetime, any device
// Device-locked codes: stored in Vercel KV (Upstash), bound on first use

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://mixcheckai.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  // ── Admin: seed a new code via GET or POST ───────────────────────────────────
  var isSeedGet = req.method === "GET" && req.query._action === "seed";
  var isSeedPost = req.method === "POST" && (req.body || {})._action === "seed";
  if (isSeedGet || isSeedPost) {
    var seedParams = isSeedGet ? req.query : (req.body || {});
    var masterCheck = (process.env.MASTER_PRO_CODE || "").trim().toUpperCase();
    var givenSecret = (seedParams.secret || "").trim().toUpperCase();
    if (!masterCheck || givenSecret !== masterCheck) return res.status(403).json({ error: "Forbidden — wrong secret" });
    var seedCode = (seedParams.code || "").trim().toUpperCase();
    var seedDays = Math.max(1, parseInt(seedParams.days || "365", 10));
    var seedSecs = seedDays * 86400;
    var isLifetime = seedParams.lifetime === "1" || seedParams.lifetime === "true";
    if (!seedCode) return res.status(400).json({ error: "Missing code" });
    var KV2 = process.env.KV_REST_API_URL; var KV2T = process.env.KV_REST_API_TOKEN;
    if (!KV2 || !KV2T) return res.status(500).json({ error: "KV not configured" });
    var kv2 = async function(cmd) {
      var r = await fetch(KV2, { method:"POST", headers:{ "Authorization":"Bearer "+KV2T, "Content-Type":"application/json" }, body:JSON.stringify(cmd) });
      return r.json();
    };
    await kv2(["SET", "code:" + seedCode, "unbound"]);
    if (isLifetime) {
      await kv2(["SET", "lifetime_code:" + seedCode, "1"]);
    } else {
      await kv2(["SET", "code_duration:" + seedCode, String(seedSecs)]);
    }
    return res.status(200).json({ ok: true, code: seedCode, days: isLifetime ? "lifetime" : seedDays, secs: isLifetime ? null : seedSecs });
  }

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  var code = (body.code || "").trim().toUpperCase();
  var deviceId = (body.deviceId || "").trim();
  var userId = (body.userId || "").trim();
  var isTrial = body.isTrial !== false;

  if (!code || !deviceId) {
    return res.status(400).json({ error: "Missing code or device info" });
  }

  var KV_URL = process.env.KV_REST_API_URL;
  var KV_TOKEN = process.env.KV_REST_API_TOKEN;

  var kvPost = async function(command) {
    var r = await fetch(KV_URL, {
      method: "POST",
      headers: { "Authorization": "Bearer " + KV_TOKEN, "Content-Type": "application/json" },
      body: JSON.stringify(command),
    });
    return r.json();
  };

  // Save Pro status to user account so it follows their login everywhere
  var saveUserPro = async function(lifetime) {
    if (!userId || !KV_URL || !KV_TOKEN) return;
    try {
      await kvPost(["SET", "user_pro:" + userId, JSON.stringify({
        isPro: true, lifetime: !!lifetime, code: code, activatedAt: new Date().toISOString()
      })]);
    } catch(e) {}
  };

  // If user is logged in and already has Pro on their account, grant immediately
  if (userId && KV_URL && KV_TOKEN) {
    try {
      var existing = await kvPost(["GET", "user_pro:" + userId]);
      if (existing.result) {
        var existingData = {};
        try { existingData = JSON.parse(existing.result); } catch(e) {}
        if (existingData.isPro) {
          return res.status(200).json({ ok: true, lifetime: !!existingData.lifetime });
        }
      }
    } catch(e) {}
  }

  // ── Master lifetime code (no device binding) ────────────────────────────────
  var master = (process.env.MASTER_PRO_CODE || "").trim().toUpperCase();
  if (master && code === master) {
    var KV_URL2 = process.env.KV_REST_API_URL;
    var KV_TOKEN2 = process.env.KV_REST_API_TOKEN;
    if (deviceId && KV_URL2 && KV_TOKEN2) {
      fetch(KV_URL2, { method:"POST", headers:{ "Authorization":"Bearer "+KV_TOKEN2, "Content-Type":"application/json" }, body:JSON.stringify(["SET","lifetime:"+deviceId,"1"]) }).catch(function(){});
    }
    await saveUserPro(true);
    return res.status(200).json({ ok: true, lifetime: true });
  }

  // ── Device-locked codes via Vercel KV ───────────────────────────────────────
  if (!KV_URL || !KV_TOKEN) {
    return res.status(400).json({ error: "Invalid code" });
  }

  try {
    var getResult = await kvPost(["GET", "code:" + code]);
    var stored = getResult.result;

    if (stored === null || stored === undefined) {
      return res.status(400).json({ error: "Invalid code" });
    }

    if (stored === "unbound") {
      await kvPost(["SET", "code:" + code, "device:" + deviceId]);
      var isLifetimeCode = (await kvPost(["GET", "lifetime_code:" + code])).result === "1";
      if (isLifetimeCode) {
        await kvPost(["SET", "lifetime:" + deviceId, "1"]);
        await saveUserPro(true);
        return res.status(200).json({ ok: true, lifetime: true });
      }
      // Check for custom duration (e.g. 3-day test codes)
      var durationResult = await kvPost(["GET", "code_duration:" + code]);
      var durationSecs = durationResult.result ? parseInt(durationResult.result, 10) : null;
      var expiresAt = durationSecs ? Date.now() + durationSecs * 1000 : null;
      if (isTrial) {
        await kvPost(["SET", "trial:" + deviceId, "1", "EX", durationSecs || 691200]);
      }
      await saveUserPro(false);
      return res.status(200).json({ ok: true, lifetime: false, expiresAt: expiresAt });
    }

    if (stored === "device:" + deviceId) {
      var isLifetimeCode2 = (await kvPost(["GET", "lifetime_code:" + code])).result === "1";
      if (isLifetimeCode2) {
        await kvPost(["SET", "lifetime:" + deviceId, "1"]);
        await saveUserPro(true);
        return res.status(200).json({ ok: true, lifetime: true });
      }
      await saveUserPro(false);
      return res.status(200).json({ ok: true, lifetime: false });
    }

    // Different device — if logged in, let account Pro check above handle it
    return res.status(403).json({
      error: "This code is already activated on another device. Sign in to your account to access Pro, or email hello@mixcheckai.com to reset it.",
    });

  } catch (err) {
    console.error("Activate error:", err);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
}
