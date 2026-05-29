// Returns current stem separation balance for a device
// GET /api/stems-balance?deviceId=xxx

var MONTHLY_LIMIT = 10;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://mixcheckai.com");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  var deviceId = (req.query.deviceId || "").trim();
  if (!deviceId) return res.status(400).json({ error: "Missing deviceId" });

  var KV_URL = process.env.KV_REST_API_URL;
  var KV_TOKEN = process.env.KV_REST_API_TOKEN;
  if (!KV_URL || !KV_TOKEN) return res.status(200).json({ isLifetime: false, monthly_used: 0, monthly_limit: MONTHLY_LIMIT, credits: 0 });

  var kvGet = async function(key) {
    var r = await fetch(KV_URL, { method:"POST", headers:{ "Authorization":"Bearer "+KV_TOKEN, "Content-Type":"application/json" }, body:JSON.stringify(["GET", key]) });
    var d = await r.json(); return d.result;
  };

  try {
    var isLifetime = (await kvGet("lifetime:" + deviceId)) === "1";
    if (isLifetime) return res.status(200).json({ isLifetime: true, monthly_used: 0, monthly_limit: MONTHLY_LIMIT, credits: 0 });

    var month = new Date().toISOString().slice(0, 7);
    var monthlyUsed = parseInt((await kvGet("stems_monthly:" + deviceId + ":" + month)) || "0", 10);
    var credits = parseInt((await kvGet("stems_credits:" + deviceId)) || "0", 10);

    return res.status(200).json({ isLifetime: false, monthly_used: monthlyUsed, monthly_limit: MONTHLY_LIMIT, credits: credits });
  } catch(err) {
    console.error("stems-balance error:", err);
    return res.status(200).json({ isLifetime: false, monthly_used: 0, monthly_limit: MONTHLY_LIMIT, credits: 0 });
  }
}
