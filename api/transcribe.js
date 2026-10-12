// Transcription runs on a paid Replicate GPU. This endpoint previously had no
// identity check and no quota of any kind, so anyone who found the URL could run
// unlimited transcriptions on our Replicate account.

import { verifiedUserId, callerIp } from "../lib/auth.js";

var DAILY_LIMIT = 10;      // per identity, per UTC day
var PRO_DAILY_LIMIT = 60;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.setHeader("Access-Control-Allow-Origin", "https://mixcheckai.com");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  try {
    var body = req.body || {};
    var audioBase64 = body.audioBase64;

    if (!audioBase64) {
      return res.status(400).json({ error: "No audio provided" });
    }

    if (!process.env.REPLICATE_API_TOKEN) {
      return res.status(500).json({ error: "Transcription not configured" });
    }

    // ── Daily quota, keyed to an identity the caller cannot rotate ─────────────
    var KV_URL = process.env.KV_REST_API_URL;
    var KV_TOKEN = process.env.KV_REST_API_TOKEN;
    if (KV_URL && KV_TOKEN) {
      try {
        var kv = async function (cmd) {
          var kr = await fetch(KV_URL, {
            method: "POST",
            headers: { "Authorization": "Bearer " + KV_TOKEN, "Content-Type": "application/json" },
            body: JSON.stringify(cmd),
          });
          return kr.json();
        };
        var tUserId = await verifiedUserId(req);
        var tDeviceId = (body.deviceId || "").trim();
        var isPro = false;
        if (tUserId) {
          var pr = await kv(["GET", "user_pro:" + tUserId]);
          isPro = !!(pr && pr.result);
        }
        if (!isPro && tDeviceId) {
          var lr = await kv(["GET", "lifetime:" + tDeviceId]);
          if (lr && lr.result === "1") isPro = true;
        }
        var idKey = tUserId ? "u:" + tUserId : "ip:" + callerIp(req);
        var key = "transcribe_rl:" + idKey + ":" + new Date().toISOString().slice(0, 10);
        var incR = await kv(["INCR", key]);
        var count = (incR && typeof incR.result === "number") ? incR.result : 1;
        if (count === 1) { try { await kv(["EXPIRE", key, 172800]); } catch (e) {} }
        if (count > (isPro ? PRO_DAILY_LIMIT : DAILY_LIMIT)) {
          return res.status(429).json({ error: "Daily transcription limit reached. It resets tomorrow." });
        }
      } catch (e) { /* KV failure → fail open, request is still size-bounded */ }
    }

    var response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Token " + process.env.REPLICATE_API_TOKEN,
        "Prefer": "wait",
      },
      body: JSON.stringify({
        version: "91ee9c0c3df30478510ff8c8a3a545add1ad0259ad3a9f78fba57fbc05ee64f7",
        input: {
          audio: audioBase64,
          word_timestamps: true,
          transcription: "plain text",
        },
      }),
    });

    if (!response.ok) {
      var errBody = await response.json().catch(function() { return {}; });
      var msg = errBody.detail || errBody.title || errBody.error || "Could not start transcription";
      return res.status(500).json({ error: "Replicate: " + msg });
    }

    var prediction = await response.json();
    return res.status(200).json({ predictionId: prediction.id });

  } catch (err) {
    console.error("Transcribe handler error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
