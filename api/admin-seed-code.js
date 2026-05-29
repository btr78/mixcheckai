// TEMPORARY — delete after use
export default async function handler(req, res) {
  if (req.query.secret !== "tmp-9z3m1p") return res.status(403).end();

  var code = (req.query.code || "").trim().toUpperCase();
  var isLifetime = req.query.lifetime === "1";
  var ttlDays = parseInt(req.query.days || "0", 10);
  if (!code) return res.status(400).json({ error: "Missing code param" });

  var KV_URL = process.env.KV_REST_API_URL;
  var KV_TOKEN = process.env.KV_REST_API_TOKEN;
  if (!KV_URL || !KV_TOKEN) return res.status(500).json({ error: "KV not configured" });

  var kvPost = async function(cmd) {
    var r = await fetch(KV_URL, { method:"POST", headers:{ "Authorization":"Bearer "+KV_TOKEN, "Content-Type":"application/json" }, body:JSON.stringify(cmd) });
    return r.json();
  };

  var codeCmd = ttlDays > 0
    ? ["SET", "code:" + code, "unbound", "EX", ttlDays * 86400]
    : ["SET", "code:" + code, "unbound"];
  var r1 = await kvPost(codeCmd);
  var r2 = isLifetime ? await kvPost(["SET", "lifetime_code:" + code, "1"]) : { result: "skipped" };

  return res.status(200).json({ ok:true, code, lifetime:isLifetime, ttl_days:ttlDays, kv_code:r1, kv_lifetime:r2 });
}
