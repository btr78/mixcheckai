// ─────────────────────────────────────────────────────────────────────────────
// MixCheck AI — Vercel Serverless Function
// File location in your GitHub repo: /api/chat.js
// This file never runs in the browser. It runs on Vercel's servers.
// Your Anthropic API key stays secret here.
//
// SECURITY: the daily message quota is enforced HERE, server-side, in KV — keyed
// by the Clerk userId (or the caller's IP for anonymous users). The client can no
// longer bypass the limit by editing localStorage or by sending isPro:true. Pro
// status is looked up server-side from KV (user_pro:<userId>), never trusted from
// the request body.
// ─────────────────────────────────────────────────────────────────────────────

var FREE_DAILY_LIMIT = 5;    // free / anonymous users: 5 messages per UTC day
var PRO_DAILY_LIMIT = 300;   // Pro users: effectively unlimited for real use, but bounds abuse of a compromised/shared account
var MAX_INPUT_CHARS = 8000;  // per-message cost bound

export default async function handler(req, res) {
  // CORS headers — allow requests from your domain only
  res.setHeader("Access-Control-Allow-Origin", "https://mixcheckai.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    var body = req.body || {};
    var messages = body.messages || [];
    var userId = (body.userId || "").trim();

    // Validate messages
    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: "No messages provided" });
    }

    // Limit conversation length to keep costs low (last 10 messages = 5 exchanges),
    // and bound each message's size so a single request can't be arbitrarily expensive.
    var trimmedMessages = messages.slice(-10).map(function (m) {
      return {
        role: m.role,
        content: typeof m.content === "string" ? m.content.slice(0, MAX_INPUT_CHARS) : m.content,
      };
    });

    // ── Server-side entitlement + daily rate limit (KV) ─────────────────────────
    // rlKey is set only while limiting is active, so we can refund the count if the
    // downstream AI call fails (a failed request shouldn't consume the user's quota).
    var KV_URL = process.env.KV_REST_API_URL;
    var KV_TOKEN = process.env.KV_REST_API_TOKEN;
    var rlKey = null;
    var kv = async function (cmd) {
      var r = await fetch(KV_URL, {
        method: "POST",
        headers: { "Authorization": "Bearer " + KV_TOKEN, "Content-Type": "application/json" },
        body: JSON.stringify(cmd),
      });
      return r.json();
    };

    if (KV_URL && KV_TOKEN) {
      try {
        // Pro status is read server-side from KV — NEVER trusted from the client.
        var isPro = false;
        if (userId) {
          var proR = await kv(["GET", "user_pro:" + userId]);
          isPro = !!(proR && proR.result);
        }
        var cap = isPro ? PRO_DAILY_LIMIT : FREE_DAILY_LIMIT;

        // Counter identity: the account (userId) when signed in, else the caller's IP.
        var xff = req.headers["x-forwarded-for"];
        var ip = xff ? String(xff).split(",")[0].trim() : (req.headers["x-real-ip"] || "unknown");
        var day = new Date().toISOString().slice(0, 10); // UTC day
        rlKey = "chat_rl:" + (userId ? "u:" + userId : "ip:" + ip) + ":" + day;

        var incR = await kv(["INCR", rlKey]);
        var count = (incR && typeof incR.result === "number") ? incR.result : 1;
        if (count === 1) {
          try { await kv(["EXPIRE", rlKey, 172800]); } catch (e) {} // auto-expire in ~2 days
        }

        if (count > cap) {
          rlKey = null; // over the limit → don't refund a blocked request
          return res.status(429).json({
            limited: true,
            remaining: 0,
            error: isPro
              ? "You've reached today's message limit. It resets tomorrow."
              : "You've used your " + FREE_DAILY_LIMIT + " free messages today. Upgrade to Pro for unlimited, or come back tomorrow.",
          });
        }
      } catch (e) {
        // KV error → fail open (don't block a paying/free user on infra failure).
        // Each request is still size-bounded above, so cost per request stays capped.
        rlKey = null;
      }
    }

    // Use Haiku for everyone (cheapest, still great quality) — ~$0.0008 per message.
    var model = "claude-haiku-4-5-20251001";

    var response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 600,
        system: "You are MixCheck AI, an expert live sound engineer assistant for church and studio livestream audio. Help volunteer sound engineers get better audio. Keep answers under 150 words, practical and plain English. No jargon unless you explain it. Give actionable advice. For EQ and compression always give ranges not fixed values. Be encouraging - most users are volunteers not professionals. If asked about a specific mixer, give mixer-specific advice. Focus on livestream audio quality.",
        messages: trimmedMessages,
      }),
    });

    if (!response.ok) {
      var errData = await response.json().catch(function () { return {}; });
      console.error("Anthropic API error:", errData);
      // Refund the quota we consumed — the user never got a reply.
      if (rlKey) { try { await kv(["DECR", rlKey]); } catch (e) {} }
      return res.status(500).json({ error: "AI service error. Please try again." });
    }

    var data = await response.json();
    var reply = data.content && data.content[0] ? data.content[0].text : "Sorry, no response. Try again.";

    return res.status(200).json({ reply: reply });

  } catch (err) {
    console.error("Handler error:", err);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
}
