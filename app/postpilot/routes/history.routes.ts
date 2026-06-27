import { Router } from "express";
import { postHistoryService } from "../services/post-history.service";

const router = Router();

// GET /api/postpilot/history
router.get("/api/postpilot/history", async (req, res) => {
  try {
    const limit = parseInt(String(req.query.limit ?? "50"), 10);
    const skip = parseInt(String(req.query.skip ?? "0"), 10);
    const [entries, total] = await Promise.all([
      postHistoryService.list(limit, skip),
      postHistoryService.count(),
    ]);
    res.json({ success: true, data: entries, total });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to list post history" });
  }
});

// GET /api/postpilot/history/stats
router.get("/api/postpilot/history/stats", async (_req, res) => {
  try {
    const stats = await postHistoryService.getStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to get stats" });
  }
});

export default router;
