import { Router } from "express";
import { productService } from "../services/product.service";

const router = Router();

// GET /api/postpilot/products
router.get("/api/postpilot/products", async (_req, res) => {
  try {
    const products = await productService.list();
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to list products" });
  }
});

// GET /api/postpilot/products/:id
router.get("/api/postpilot/products/:id", async (req, res) => {
  try {
    const product = await productService.getById(req.params.id);
    if (!product) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to get product" });
  }
});

// POST /api/postpilot/products
router.post("/api/postpilot/products", async (req, res) => {
  try {
    const { name, imageUrl, description, price, purchaseLink } = req.body;
    if (!name || !price) {
      return res.status(400).json({ success: false, error: "name and price are required" });
    }
    const product = await productService.create({ name, imageUrl, description, price, purchaseLink });
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to create product" });
  }
});

// PUT /api/postpilot/products/:id
router.put("/api/postpilot/products/:id", async (req, res) => {
  try {
    const updated = await productService.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to update product" });
  }
});

// DELETE /api/postpilot/products/:id
router.delete("/api/postpilot/products/:id", async (req, res) => {
  try {
    const deleted = await productService.delete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data: deleted });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to delete product" });
  }
});

// POST /api/postpilot/products/reorder
router.post("/api/postpilot/products/reorder", async (req, res) => {
  try {
    const { productIds } = req.body;
    if (!Array.isArray(productIds)) {
      return res.status(400).json({ success: false, error: "productIds array required" });
    }
    await productService.reorder(productIds);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to reorder products" });
  }
});

export default router;
