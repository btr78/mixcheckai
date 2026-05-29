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

    if (!audioBase64) {
      return res.status(400).json({ error: "No audio provided" });
    }

    if (!process.env.REPLICATE_API_TOKEN) {
      return res.status(500).json({ error: "Stem separation not configured" });
    }

    // Create prediction using cjwbw/demucs htdemucs model
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
          model: "htdemucs",
          stem: null,
          two_stems: null,
          int24: false,
          float32: false,
          clip_mode: "rescale",
          shifts: 1,
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
    return res.status(200).json({ predictionId: prediction.id });

  } catch (err) {
    console.error("Stems handler error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
