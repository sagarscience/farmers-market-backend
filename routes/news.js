import express from "express";
import Parser from "rss-parser";

const router = express.Router();
const parser = new Parser();

// @route   GET /api/news/agri
// @desc    Fetch top agriculture news from The Hindu RSS feed
// @access  Public
router.get("/agri", async (req, res) => {
  try {
    console.log("⏳ Fetching agriculture RSS feed...");

    const feedUrl = "https://www.thehindu.com/news/national/agriculture/feeder/default.rss";
    const feed = await parser.parseURL(feedUrl);

    console.log(`✅ Fetched ${feed.items.length} items from feed: ${feed.title}`);

    const items = feed.items.slice(0, 5).map((item) => ({
      title: item.title,
      url: item.link,
      source: feed.title || "The Hindu",
      publishedAt: new Date(item.pubDate).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    }));

    res.status(200).json(items);
  } catch (err) {
    console.error("❌ Failed to fetch RSS feed:", err.message);
    res.status(500).json({ error: "Failed to fetch news", details: err.message });
  }
});

export default router;
