import express from "express";
import Parser from "rss-parser";

const router = express.Router();
const parser = new Parser();

router.get("/agri", async (req, res) => {
  try {
    console.log("⏳ Fetching agriculture RSS feed...");

    const feed = await parser.parseURL("https://www.thehindu.com/news/national/agriculture/feeder/default.rss");

    console.log("✅ Feed fetched. Items:", feed.items.length);

    const items = feed.items.slice(0, 5).map((i) => ({
      title: i.title,
      url: i.link,
      source: feed.title || "The Hindu",
      publishedAt: new Date(i.pubDate).toLocaleDateString(),
    }));

    res.json(items);
  } catch (err) {
    console.error("❌ RSS fetch error:", err.message); // Log the actual issue
    res.status(500).json({ error: err.message });
  }
});

export default router;
