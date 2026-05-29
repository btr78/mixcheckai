// Add 10 stem credits after a one-time Stripe payment
// GET /api/add-stems?session_id=xxx&deviceId=xxx

var CREDITS_PER_PACK = 10;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://mixcheckai.com");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  var sessionId = (req.query.session_id || "").replace(/\s/g, "");
  var deviceId = (req.query.deviceId || "").trim();

  if (!sessionId || !sessionId.startsWith("cs_")) return res.status(400).json({ error: "Invalid session" });
  if (!deviceId) return res.status(400).json({ error: "Missing deviceId" });

  var KV_URL = process.env.KV_REST_API_URL;
  var KV_TOKEN = process.env.KV_REST_API_TOKEN;
  var STRIPE_KEY = process.env.STRIPE_SECRET_KEY;

  if (!KV_URL || !KV_TOKEN || !STRIPE_KEY) return res.status(500).json({ error: "Server not configured" });

  var kvPost = async function(cmd) {
    var r = await fetch(KV_URL, { method:"POST", headers:{ "Authorization":"Bearer "+KV_TOKEN, "Content-Type":"application/json" }, body:JSON.stringify(cmd) });
    return r.json();
  };

  try {
    // Idempotent — prevent double-crediting same session
    var existing = await kvPost(["GET", "stems_session:" + sessionId]);
    if (existing.result) {
      var credits = parseInt((await kvPost(["GET", "stems_credits:" + deviceId])).result || "0", 10);
      return res.status(200).json({ ok: true, already_applied: true, credits: credits });
    }

    // Verify with Stripe
    var stripeResp = await fetch("https://api.stripe.com/v1/checkout/sessions/" + sessionId, {
      headers: { "Authorization": "Basic " + Buffer.from(STRIPE_KEY + ":").toString("base64") },
    });
    if (!stripeResp.ok) return res.status(400).json({ error: "Could not verify payment" });

    var session = await stripeResp.json();
    if (session.payment_status !== "paid") return res.status(400).json({ error: "Payment not completed" });
    if (session.mode !== "payment") return res.status(400).json({ error: "Invalid session type" });

    // Add credits
    var incrResult = await kvPost(["INCRBY", "stems_credits:" + deviceId, CREDITS_PER_PACK]);
    var newBalance = parseInt(incrResult.result || String(CREDITS_PER_PACK), 10);

    // Mark session as used
    await kvPost(["SET", "stems_session:" + sessionId, deviceId, "EX", 2592000]);

    return res.status(200).json({ ok: true, credits_added: CREDITS_PER_PACK, credits: newBalance });

  } catch(err) {
    console.error("add-stems error:", err);
    return res.status(500).json({ error: "Server error. Please try again or contact hello@mixcheckai.com" });
  }
}
