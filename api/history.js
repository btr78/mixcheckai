// GET  /api/history  — returns cloud mix history for the signed-in user
// POST /api/history  — { entry } saves entry to cloud for the signed-in user
//
// The account is taken from the verified Clerk token ONLY. A userId in the query
// or body is ignored, so one caller can never read, overwrite or clear another
// user's history.

import { requireUserId } from "../lib/auth.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://mixcheckai.com");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  // Identity first: an unauthenticated caller should be turned away before the
  // handler reveals anything about server state.
  var userId = await requireUserId(req, res);
  if (!userId) return;

  var KV_URL = process.env.KV_REST_API_URL;
  var KV_TOKEN = process.env.KV_REST_API_TOKEN;
  if (!KV_URL || !KV_TOKEN) return res.status(500).json({ error: "Not configured" });

  var kvPost = async function(cmd) {
    var r = await fetch(KV_URL, { method:"POST", headers:{ "Authorization":"Bearer "+KV_TOKEN, "Content-Type":"application/json" }, body:JSON.stringify(cmd) });
    return r.json();
  };

  if (req.method === "GET") {
    var result = await kvPost(["GET", "history:" + userId]);
    var history = [];
    try { history = result.result ? JSON.parse(result.result) : []; } catch(e) {}
    return res.status(200).json({ history: history });
  }

  if (req.method === "POST") {
    var body = req.body || {};
    var entry = body.entry;
    if (!entry && !body.clear) return res.status(400).json({ error: "Missing entry" });
    if (body.clear) {
      await kvPost(["DEL", "history:" + userId]);
      return res.status(200).json({ ok: true, cleared: true });
    }
    var existing = await kvPost(["GET", "history:" + userId]);
    var arr = [];
    try { arr = existing.result ? JSON.parse(existing.result) : []; } catch(e) {}
    arr.unshift(entry);
    if (arr.length > 50) arr = arr.slice(0, 50);
    await kvPost(["SET", "history:" + userId, JSON.stringify(arr)]);
    return res.status(200).json({ ok: true, count: arr.length });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
