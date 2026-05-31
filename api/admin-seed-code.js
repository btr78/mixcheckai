// Temporary one-use admin endpoint — DELETE AFTER USE
export default async function handler(req, res) {
  if (req.query.secret !== process.env.MASTER_PRO_CODE) return res.status(403).end();

  var KV_URL   = process.env.KV_REST_API_URL;
  var KV_TOKEN = process.env.KV_REST_API_TOKEN;
  var kv = async function(cmd) {
    var r = await fetch(KV_URL, { method:"POST", headers:{ "Authorization":"Bearer "+KV_TOKEN, "Content-Type":"application/json" }, body:JSON.stringify(cmd) });
    return r.json();
  };

  var code  = (req.query.code  || "").toUpperCase().trim();
  var days  = parseInt(req.query.days  || "3", 10);
  var secs  = days * 86400;

  if (!code) return res.status(400).json({ error: "Missing code param" });

  await kv(["SET", "code:" + code, "unbound"]);
  await kv(["SET", "code_duration:" + code, String(secs)]);

  return res.status(200).json({ ok:true, code, days, secs });
}
