import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

const router = express.Router();

// Middleware to allow only admin users
const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};

router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    order.trackingHistory.push({ status });
    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (err) {
    res.status(500).json({ error: "Error updating order" });
  }
});

// GET /api/admin/users
router.get("/users", protect, adminOnly, async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

// GET /api/admin/products
router.get("/products", protect, adminOnly, async (req, res) => {
  const products = await Product.find().populate("createdBy", "name email");
  res.json(products);
});

// GET /api/admin/orders
router.get("/orders", protect, adminOnly, async (req, res) => {
  const orders = await Order.find()
    .populate("buyer", "name email")
    .populate("products.productId", "name");
  res.json(orders);
});

// DELETE user
router.delete("/users/:id", protect, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user" });
  }
});

// DELETE product
router.delete("/products/:id", protect, adminOnly, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete product" });
  }
});


export default router;
