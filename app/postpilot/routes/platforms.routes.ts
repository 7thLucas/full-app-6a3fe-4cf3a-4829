import { Router } from "express";
import { platformService } from "../services/platform.service";
import type { PlatformName } from "../models/platform.model";

const router = Router();

// GET /api/postpilot/platforms
router.get("/api/postpilot/platforms", async (_req, res) => {
  try {
    const platforms = await platformService.list();
    res.json({ success: true, data: platforms });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to list platforms" });
  }
});

// POST /api/postpilot/platforms/:name/connect — mock OAuth
router.post("/api/postpilot/platforms/:name/connect", async (req, res) => {
  try {
    const platformName = decodeURIComponent(req.params.name) as PlatformName;
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ success: false, error: "username is required" });
    }
    const platform = await platformService.connect(platformName, username);
    res.json({ success: true, data: platform });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to connect platform" });
  }
});

// POST /api/postpilot/platforms/:name/disconnect
router.post("/api/postpilot/platforms/:name/disconnect", async (req, res) => {
  try {
    const platformName = decodeURIComponent(req.params.name) as PlatformName;
    const platform = await platformService.disconnect(platformName);
    res.json({ success: true, data: platform });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to disconnect platform" });
  }
});

export default router;
