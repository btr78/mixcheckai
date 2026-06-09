// TEMPORARY one-off seeder — guarded by a random key, removed immediately after use.
// Reads KV creds at runtime (sensitive env is readable at runtime) and creates a
// 7-day test Pro code. DELETE THIS FILE after seeding.
export default async function handler(req, res) {
  var GUARD = "qz7K2m9XpL4vTn8w";
  if ((req.query.key || "") !== GUARD) return res.status(403).json({ error: "forbidden" });

  var code = (req.query.code || "MIXTEST7").trim().toUpperCase();
  var days = Math.max(1, parseInt(req.query.days || "7", 10));
  var secs = days * 86400;

  var KV_URL = process.env.KV_REST_API_URL;
  var KV_TOKEN = process.env.KV_REST_API_TOKEN;
  if (!KV_URL || !KV_TOKEN) return res.status(500).json({ error: "KV not configured" });

  var kv = async function (cmd) {
    var r = await fetch(KV_URL, {
      method: "POST",
      headers: { "Authorization": "Bearer " + KV_TOKEN, "Content-Type": "application/json" },
      body: JSON.stringify(cmd),
    });
    return r.json();
  };

  try {
    await kv(["SET", "code:" + code, "unbound"]);
    await kv(["SET", "code_duration:" + code, String(secs)]);
    return res.status(200).json({ ok: true, code: code, days: days });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
