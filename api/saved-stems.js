// GET /api/saved-stems — returns the signed-in user's saved stems list.
// Account comes from the verified Clerk token only; a userId in the query is ignored.

import { requireUserId } from "../lib/auth.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://mixcheckai.com");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  var userId = await requireUserId(req, res);
  if (!userId) return;

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
