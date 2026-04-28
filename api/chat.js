// ─────────────────────────────────────────────────────────────────────────────
// MixCheck AI — Vercel Serverless Function
// File location in your GitHub repo: /api/chat.js
// This file never runs in the browser. It runs on Vercel's servers.
// Your Anthropic API key stays secret here.
// ─────────────────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // CORS headers — allow requests from your domain only
  res.setHeader("Access-Control-Allow-Origin", "https://mixcheckai.com");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  try {
    var body = req.body;
    var messages = body.messages || [];
    var isPro = body.isPro || false;

    // Validate messages
    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: "No messages provided" });
    }

    // Limit conversation length to keep costs low
    // Keep only last 10 messages (5 exchanges)
    var trimmedMessages = messages.slice(-10);

    // Use Haiku for free users (cheapest), Haiku for Pro too (still great quality)
    // Haiku costs ~$0.0008 per message — 1000 messages = $0.80
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
      var errData = await response.json();
      console.error("Anthropic API error:", errData);
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
