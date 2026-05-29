// TEMPORARY — delete after use
export default async function handler(req, res) {
  if (req.query.secret !== "tmp-7x2k9q") return res.status(403).end();

  var code = (req.query.code || "").trim().toUpperCase();
  var ttlDays = parseInt(req.query.days || "3", 10);
  if (!code) return res.status(400).json({ error: "Missing code param" });

  var KV_URL = process.env.KV_REST_API_URL;
  var KV_TOKEN = process.env.KV_REST_API_TOKEN;
  if (!KV_URL || !KV_TOKEN) return res.status(500).json({ error: "KV not configured" });

  var r = await fetch(KV_URL, {
    method: "POST",
    headers: { "Authorization": "Bearer " + KV_TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify(["SET", "code:" + code, "unbound", "EX", ttlDays * 86400]),
  });
  var d = await r.json();
  return res.status(200).json({ ok: true, code, ttl_days: ttlDays, kv: d });
}
