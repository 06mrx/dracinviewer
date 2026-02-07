import express from "express";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

app.get("/api/episodes", async (req, res) => {
  const { url, start, end } = req.query;

  if (!url || !start || !end) {
    return res.status(400).json({ error: "parameter kurang" });
  }

  const results = [];

  for (let ep = Number(start); ep <= Number(end); ep++) {
    const epUrl = `${url}?ep=${ep}`;

    try {
      const response = await fetch(epUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      const html = await response.text();

      const videoBlock = html.match(
        /<video[^>]+id=["']player["'][\s\S]*?<\/video>/i
      );

      if (!videoBlock) {
        results.push({ ep, error: "video tag not found" });
        continue;
      }

      const source = videoBlock[0].match(
        /<source[^>]+src=["']([^"']+)["']/
      );

      if (!source) {
        results.push({ ep, error: "source not found" });
        continue;
      }

      results.push({
        ep,
        videoUrl: source[1],
      });
    } catch (err) {
      results.push({
        ep,
        error: err.message,
      });
    }
  }

  res.json(results);
});

app.listen(PORT, () => {
  console.log(`Server running → http://localhost:${PORT}`);
});
