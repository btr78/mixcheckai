// Stem separation via Replicate Demucs model
// Accepts base64 audio, starts prediction, returns predictionId for polling

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.setHeader("Access-Control-Allow-Origin", "https://mixcheckai.com");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  try {
    var body = req.body;
    var audioBase64 = body.audioBase64;
    var deviceId = (body.deviceId || "").trim();
    var userId = (body.userId || "").trim();
    var isTrial = !!body.isTrial;
    // Credits to deduct: 1 per 5 min of audio (client calculates, server validates)
    var creditsNeeded = Math.max(1, Math.min(20, parseInt(body.creditsNeeded || "1", 10)));

    if (!audioBase64) {
      return res.status(400).json({ error: "No audio provided" });
    }

    if (!process.env.REPLICATE_API_TOKEN) {
      return res.status(500).json({ error: "Stem separation not configured" });
    }

    var MONTHLY_LIMIT = 10;
    var KV_URL = process.env.KV_REST_API_URL;
    var KV_TOKEN = process.env.KV_REST_API_TOKEN;

    // Single-device enforcement (server-side, FAIL-OPEN): block only when we're
    // certain another device holds a fresh session lock for this account.
    if (userId && deviceId && KV_URL && KV_TOKEN) {
      try {
        var lockR = await fetch(KV_URL, {
          method: "POST",
          headers: { "Authorization": "Bearer " + KV_TOKEN, "Content-Type": "application/json" },
          body: JSON.stringify(["GET", "session_lock:" + userId]),
        });
        var lockD = await lockR.json();
        if (lockD && lockD.result) {
          var lock = null;
          try { lock = JSON.parse(lockD.result); } catch (e) {}
          // Fresh lock (within 150s TTL anyway) held by a DIFFERENT device → block.
          if (lock && lock.deviceId && lock.deviceId !== deviceId) {
            return res.status(409).json({ error: "Your Pro account is active on another device. Only one device can separate stems at a time — open MixCheck AI there, or refresh here to take over." });
          }
        }
      } catch (e) { /* fail open — never block on infra error */ }
    }

    if (deviceId && KV_URL && KV_TOKEN) {
      var kvPost = async function(cmd) {
        var r = await fetch(KV_URL, { method:"POST", headers:{ "Authorization":"Bearer "+KV_TOKEN, "Content-Type":"application/json" }, body:JSON.stringify(cmd) });
        return r.json();
      };

      // Lifetime devices skip all limits
      var lifetimeResult = await kvPost(["GET", "lifetime:" + deviceId]);
      var isLifetime = lifetimeResult.result === "1";

      if (!isLifetime) {
        if (isTrial) {
          // Trial: max 3 total regardless of file length (client byte-slices to ~3 min)
          var trialCount = parseInt((await kvPost(["GET", "stems:" + deviceId])).result || "0", 10);
          if (trialCount >= 3) {
            return res.status(403).json({ error: "You've used all 3 trial stem separations. Unlimited monthly access starts when your trial converts to a paid subscription." });
          }
          await kvPost(["SET", "stems:" + deviceId, String(trialCount + 1), "EX", 691200]);
        } else {
          // Paid subscriber: deduct creditsNeeded from monthly quota + bonus credits
          var month = new Date().toISOString().slice(0, 7);
          var monthKey = "stems_monthly:" + deviceId + ":" + month;
          var monthlyUsed = parseInt((await kvPost(["GET", monthKey])).result || "0", 10);
          var credits = parseInt((await kvPost(["GET", "stems_credits:" + deviceId])).result || "0", 10);

          var monthlyRemaining = Math.max(0, MONTHLY_LIMIT - monthlyUsed);
          var totalAvailable = monthlyRemaining + credits;

          if (totalAvailable < creditsNeeded) {
            return res.status(403).json({
              error: creditsNeeded > 1
                ? "Not enough credits for this file (" + creditsNeeded + " needed, " + totalAvailable + " available). Buy more or upload a shorter clip."
                : "Monthly limit reached",
              monthly_used: monthlyUsed,
              monthly_limit: MONTHLY_LIMIT,
              credits: credits,
              credits_needed: creditsNeeded,
            });
          }

          // Deduct from monthly quota first, then bonus credits
          var fromMonthly = Math.min(monthlyRemaining, creditsNeeded);
          var fromBonus = creditsNeeded - fromMonthly;
          if (fromMonthly > 0) {
            await kvPost(["SET", monthKey, String(monthlyUsed + fromMonthly), "EX", 3024000]);
            monthlyUsed = monthlyUsed + fromMonthly;
          }
          if (fromBonus > 0) {
            await kvPost(["DECRBY", "stems_credits:" + deviceId, fromBonus]);
            credits = credits - fromBonus;
          }
          // Attach balance to response
          res.locals = res.locals || {};
          res.locals.stemsBalance = { monthly_used: monthlyUsed, monthly_limit: MONTHLY_LIMIT, credits: credits };
        }
      }
    }

    // TEMP: reverted to stock htdemucs_6s (fast) while our fine-tuned model's GPU
    // image is rebuilt. Swap back to 054b0fd4... once verified GPU-fast.
    var response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Token " + process.env.REPLICATE_API_TOKEN,
      },
      body: JSON.stringify({
        version: "25a173108cff36ef9f80f854c162d01df9e6528be175794b81158fa03836d953",
        input: {
          audio: audioBase64,
          model: "htdemucs_6s",
          clip_mode: "rescale",
          shifts: 2,
          overlap: 0.25,
          jobs: 0,
        },
      }),
    });

    if (!response.ok) {
      var errBody = await response.json().catch(function() { return {}; });
      console.error("Replicate error:", JSON.stringify(errBody));
      var msg = errBody.detail || errBody.title || errBody.error || "Could not start stem separation";
      return res.status(500).json({ error: "Replicate: " + msg });
    }

    var prediction = await response.json();
    var balance = (res.locals && res.locals.stemsBalance) || null;
    return res.status(200).json({ predictionId: prediction.id, balance: balance });

  } catch (err) {
    console.error("Stems handler error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
