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
      return res.status(500).json({ error: "Transcription not configured" });
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
