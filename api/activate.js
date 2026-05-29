// Pro code activation — server-side validation with device locking
// Master code: env var MASTER_PRO_CODE — lifetime, any device
// Device-locked codes: stored in Vercel KV (Upstash), bound on first use

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://mixcheckai.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  var body = req.body || {};
  var code = (body.code || "").trim().toUpperCase();
  var deviceId = (body.deviceId || "").trim();
  var isTrial = body.isTrial !== false; // default true; false = immediate-pay, skip trial limits

  if (!code || !deviceId) {
    return res.status(400).json({ error: "Missing code or device info" });
  }

  // ── Master lifetime code (no device binding) ────────────────────────────────
  var master = (process.env.MASTER_PRO_CODE || "").trim().toUpperCase();
  if (master && code === master) {
    // Store lifetime flag in KV so stems.js can verify server-side
    var KV_URL2 = process.env.KV_REST_API_URL;
    var KV_TOKEN2 = process.env.KV_REST_API_TOKEN;
    if (deviceId && KV_URL2 && KV_TOKEN2) {
      fetch(KV_URL2, { method:"POST", headers:{ "Authorization":"Bearer "+KV_TOKEN2, "Content-Type":"application/json" }, body:JSON.stringify(["SET","lifetime:"+deviceId,"1"]) }).catch(function(){});
    }
    return res.status(200).json({ ok: true, lifetime: true });
  }

  // ── Device-locked codes via Vercel KV ───────────────────────────────────────
  var KV_URL = process.env.KV_REST_API_URL;
  var KV_TOKEN = process.env.KV_REST_API_TOKEN;

  if (!KV_URL || !KV_TOKEN) {
    return res.status(400).json({ error: "Invalid code" });
  }

  try {
    var kvPost = async function(command) {
      var r = await fetch(KV_URL, {
        method: "POST",
        headers: { "Authorization": "Bearer " + KV_TOKEN, "Content-Type": "application/json" },
        body: JSON.stringify(command),
      });
      return r.json();
    };

    // Look up the code
    var getResult = await kvPost(["GET", "code:" + code]);
    var stored = getResult.result; // null = not found | "unbound" = available | "device:xxx" = bound

    if (stored === null || stored === undefined) {
      return res.status(400).json({ error: "Invalid code" });
    }

    if (stored === "unbound") {
      // First use — bind to this device permanently
      await kvPost(["SET", "code:" + code, "device:" + deviceId]);
      // Only set trial flag for trial subscribers; immediate-pay users get unlimited stems
      if (isTrial) {
        await kvPost(["SET", "trial:" + deviceId, "1", "EX", 691200]);
      }
      return res.status(200).json({ ok: true, lifetime: false });
    }

    if (stored === "device:" + deviceId) {
      // Same device re-activating — allow
      return res.status(200).json({ ok: true, lifetime: false });
    }

    // Different device — reject
    return res.status(403).json({
      error: "This code is already activated on another device. Email hello@mixcheckai.com to reset it.",
    });

  } catch (err) {
    console.error("Activate error:", err);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
}
