// GET /api/saved-stems?userId=xxx — returns saved stems list for a user

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://mixcheckai.com");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  var userId = (req.query.userId || "").trim();
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  var KV_URL   = process.env.KV_REST_API_URL;
  var KV_TOKEN = process.env.KV_REST_API_TOKEN;
  if (!KV_URL || !KV_TOKEN) return res.status(200).json({ stems: [] });

  try {
    var r = await fetch(KV_URL, { method:"POST", headers:{ "Authorization":"Bearer "+KV_TOKEN, "Content-Type":"application/json" }, body:JSON.stringify(["GET", "saved_stems:" + userId]) });
    var d = await r.json();
    var stems = [];
    try { stems = d.result ? JSON.parse(d.result) : []; } catch(e) {}
    return res.status(200).json({ stems: stems });
  } catch(e) {
    return res.status(200).json({ stems: [] });
  }
}
