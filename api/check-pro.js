// GET /api/check-pro?userId=xxx — returns cloud Pro status for a Clerk user

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://mixcheckai.com");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  var userId = (req.query.userId || "").trim();
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  var KV_URL   = process.env.KV_REST_API_URL;
  var KV_TOKEN = process.env.KV_REST_API_TOKEN;
  if (!KV_URL || !KV_TOKEN) return res.status(200).json({ isPro: false });

  try {
    var r = await fetch(KV_URL, {
      method: "POST",
      headers: { "Authorization": "Bearer " + KV_TOKEN, "Content-Type": "application/json" },
      body: JSON.stringify(["GET", "user_pro:" + userId]),
    });
    var d = await r.json();
    if (!d.result) return res.status(200).json({ isPro: false });
    var data = {};
    try { data = JSON.parse(d.result); } catch(e) {}
    return res.status(200).json({
      isPro: true,
      lifetime: !!data.lifetime,
      activatedAt: data.activatedAt || null,
      code: data.code || null,
    });
  } catch(e) {
    return res.status(200).json({ isPro: false });
  }
}
