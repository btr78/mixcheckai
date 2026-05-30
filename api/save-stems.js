// POST /api/save-stems
// Downloads each Replicate stem URL, uploads to Vercel Blob (permanent), saves ref in KV.

import { put } from "@vercel/blob";

var MAX_SAVED = 20;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://mixcheckai.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  var body = req.body || {};
  var userId   = (body.userId || "").trim();
  var stemUrls = body.stemUrls || {};
  var fileName = body.fileName || "Recording";
  var date     = body.date || new Date().toISOString();

  if (!userId || Object.keys(stemUrls).length === 0) {
    return res.status(400).json({ error: "Missing userId or stemUrls" });
  }

  var BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
  if (!BLOB_TOKEN) return res.status(500).json({ error: "Blob storage not configured" });

  var sessionId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  var savedUrls = {};
  var tracks = Object.entries(stemUrls);

  for (var i = 0; i < tracks.length; i++) {
    var track = tracks[i][0];
    var url   = tracks[i][1];
    if (!url) continue;
    try {
      var r = await fetch(url);
      if (!r.ok) continue;
      var buf = await r.arrayBuffer();
      var result = await put(
        "stems/" + userId + "/" + sessionId + "/" + track + ".mp3",
        buf,
        { access: "public", contentType: "audio/mpeg", token: BLOB_TOKEN }
      );
      savedUrls[track] = result.url;
    } catch(e) {
      console.error("Blob upload failed for " + track + ":", e.message);
    }
  }

  if (Object.keys(savedUrls).length === 0) {
    return res.status(500).json({ error: "Could not save any stems — Replicate URLs may have expired" });
  }

  var KV_URL   = process.env.KV_REST_API_URL;
  var KV_TOKEN = process.env.KV_REST_API_TOKEN;
  if (KV_URL && KV_TOKEN) {
    var kvPost = async function(cmd) {
      var kv = await fetch(KV_URL, { method:"POST", headers:{ "Authorization":"Bearer "+KV_TOKEN, "Content-Type":"application/json" }, body:JSON.stringify(cmd) });
      return kv.json();
    };
    var existing = await kvPost(["GET", "saved_stems:" + userId]);
    var arr = [];
    try { arr = existing.result ? JSON.parse(existing.result) : []; } catch(e) {}
    arr.unshift({ id: sessionId, fileName: fileName, date: date, stems: savedUrls });
    if (arr.length > MAX_SAVED) arr = arr.slice(0, MAX_SAVED);
    await kvPost(["SET", "saved_stems:" + userId, JSON.stringify(arr)]);
  }

  return res.status(200).json({ ok: true, id: sessionId, stems: savedUrls });
}
