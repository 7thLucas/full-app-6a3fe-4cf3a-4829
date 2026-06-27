import { Router } from "express";
import { scheduleService } from "../services/schedule.service";
import { runPublishingJob } from "../services/publisher.service";
import { getNextProductInRotation } from "../services/publisher.service";

const router = Router();

// GET /api/postpilot/schedule
router.get("/api/postpilot/schedule", async (_req, res) => {
  try {
    const schedule = await scheduleService.get();
    res.json({ success: true, data: schedule });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to get schedule" });
  }
});

// PUT /api/postpilot/schedule
router.put("/api/postpilot/schedule", async (req, res) => {
  try {
    const { postingTime, timezone, isEnabled } = req.body;
    const updated = await scheduleService.update({ postingTime, timezone, isEnabled });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to update schedule" });
  }
});

// POST /api/postpilot/schedule/run — manually trigger publishing
router.post("/api/postpilot/schedule/run", async (req, res) => {
  try {
    const template =
      req.body.captionTemplate ||
      "Check out {name}! {description} — Only {price}. Shop now: {link}";
    const result = await runPublishingJob(template);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to run publishing job" });
  }
});

// GET /api/postpilot/schedule/next-product — preview next product
router.get("/api/postpilot/schedule/next-product", async (_req, res) => {
  try {
    const product = await getNextProductInRotation();
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to get next product" });
  }
});

export default router;
