// Poll Replicate prediction status for stem separation

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.setHeader("Access-Control-Allow-Origin", "https://mixcheckai.com");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  var predictionId = req.query.id;
  if (!predictionId) {
    return res.status(400).json({ error: "Missing prediction ID" });
  }

  if (!process.env.REPLICATE_API_TOKEN) {
    return res.status(500).json({ error: "Stem separation not configured" });
  }

  try {
    var response = await fetch("https://api.replicate.com/v1/predictions/" + predictionId, {
      headers: {
        "Authorization": "Token " + process.env.REPLICATE_API_TOKEN,
      },
    });

    if (!response.ok) {
      return res.status(500).json({ error: "Could not check prediction status" });
    }

    var prediction = await response.json();

    // Normalize output: Demucs returns an array of URLs, map to named stems
    var output = null;
    if (prediction.status === "succeeded" && prediction.output) {
      var raw = prediction.output;
      if (Array.isArray(raw)) {
        output = {};
        var stemOrder = ["drums", "bass", "vocals", "guitar", "piano", "other"];
        raw.forEach(function(url, i) {
          var key = stemOrder[i] || ("stem" + (i + 1));
          // Try to extract stem name from URL filename if possible
          var match = url.match(/[/_-](drums|bass|vocals|guitar|piano|other)[._/-]/i);
          if (match) key = match[1].toLowerCase();
          output[key] = url;
        });
      } else if (typeof raw === "object") {
        output = raw;
      }
    }

    return res.status(200).json({
      status: prediction.status,
      output: output,
      error: prediction.error || null,
    });

  } catch (err) {
    console.error("Stems status error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
