// Generate a unique Pro access code after Stripe payment
// Called from the success page with ?session_id=xxx
// Verifies payment with Stripe, generates code, stores in KV, emails customer

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://mixcheckai.com");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  var sessionId = (req.query.session_id || "").trim();
  if (!sessionId || !sessionId.startsWith("cs_")) {
    return res.status(400).json({ error: "Invalid session" });
  }

  var KV_URL = process.env.KV_REST_API_URL;
  var KV_TOKEN = process.env.KV_REST_API_TOKEN;
  var STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
  var RESEND_KEY = process.env.RESEND_API_KEY;

  if (!KV_URL || !KV_TOKEN || !STRIPE_KEY) {
    return res.status(500).json({ error: "Server not configured" });
  }

  var kvPost = async function(command) {
    var r = await fetch(KV_URL, {
      method: "POST",
      headers: { "Authorization": "Bearer " + KV_TOKEN, "Content-Type": "application/json" },
      body: JSON.stringify(command),
    });
    return r.json();
  };

  try {
    // Idempotent: return existing code if already generated for this session
    var existing = await kvPost(["GET", "session:" + sessionId]);
    if (existing.result && existing.result !== "generating") {
      return res.status(200).json({ code: existing.result });
    }

    // Verify payment with Stripe
    var stripeResp = await fetch("https://api.stripe.com/v1/checkout/sessions/" + sessionId, {
      headers: {
        "Authorization": "Basic " + Buffer.from(STRIPE_KEY + ":").toString("base64"),
      },
    });

    if (!stripeResp.ok) {
      return res.status(400).json({ error: "Could not verify payment" });
    }

    var session = await stripeResp.json();

    if (session.payment_status !== "paid") {
      return res.status(400).json({ error: "Payment not completed yet" });
    }

    // Generate unique code: MCA-XXXX-XXXX (no ambiguous chars)
    var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    var part = function() {
      var s = "";
      for (var i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)];
      return s;
    };
    var code = "MCA-" + part() + "-" + part();

    // Store code as unbound (device locked on first activation)
    await kvPost(["SET", "code:" + code, "unbound"]);
    // Map session → code for 30 days (idempotency + success page lookup)
    await kvPost(["SET", "session:" + sessionId, code, "EX", 2592000]);

    // Send email via Resend
    var customerEmail = session.customer_details && session.customer_details.email;
    if (RESEND_KEY && customerEmail) {
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + RESEND_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "MixCheck AI <hello@mixcheckai.com>",
          to: customerEmail,
          subject: "Your MixCheck AI Pro Access Code",
          html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#07090f;font-family:sans-serif;">
<div style="max-width:480px;margin:40px auto;padding:40px 24px;background:#07090f;border:1px solid #1a1f2e;border-radius:16px;">
  <div style="font-size:32px;margin-bottom:12px;">🎛️</div>
  <h1 style="color:#00e5a0;font-size:26px;font-weight:900;margin:0 0 8px;letter-spacing:-0.5px;">MixCheck AI Pro</h1>
  <p style="color:#6b7280;font-size:14px;margin:0 0 32px;line-height:1.6;">Thanks for subscribing! Here is your personal access code — keep it safe.</p>
  <div style="background:#0d1017;border:2px solid #00e5a0;border-radius:14px;padding:28px;text-align:center;margin-bottom:32px;">
    <div style="font-size:10px;letter-spacing:3px;color:#6b7280;font-weight:700;text-transform:uppercase;margin-bottom:10px;">Your Pro Code</div>
    <div style="font-size:30px;font-weight:900;color:#00e5a0;letter-spacing:5px;font-family:monospace;">${code}</div>
  </div>
  <p style="color:#9ca3af;font-size:14px;line-height:1.7;margin:0 0 12px;">
    <strong style="color:#e8eaf0;">To activate on a new device:</strong><br>
    Go to <a href="https://mixcheckai.com" style="color:#00e5a0;text-decoration:none;">mixcheckai.com</a> → click <strong style="color:#e8eaf0;">Get Pro</strong> in the menu → enter your code.
  </p>
  <p style="color:#4a5568;font-size:13px;line-height:1.6;border-top:1px solid #1a1f2e;padding-top:16px;margin:0;">
    This code activates on one device at a time. Need to reset it or get help?<br>
    Email <a href="mailto:hello@mixcheckai.com" style="color:#00e5a0;">hello@mixcheckai.com</a>
  </p>
</div>
</body></html>`,
        }),
      }).catch(function(e) { console.error("Resend error:", e); });
    }

    return res.status(200).json({ code: code });

  } catch (err) {
    console.error("generate-code error:", err);
    return res.status(500).json({ error: "Server error. Please try again or contact hello@mixcheckai.com" });
  }
}
