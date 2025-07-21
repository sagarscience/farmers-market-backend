import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

const router = express.Router();

// Middleware to allow only admin users
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};

// PUT /api/admin/:id/status - Update order status
router.put("/:id/status", protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    order.trackingHistory.push({ status });
    await order.save();

    res.status(200).json({ message: "Order status updated", order });
  } catch (err) {
    console.error("Error updating order status:", err.message);
    res.status(500).json({ message: "Error updating order", error: err.message });
  }
});

// GET /api/admin/users - Get all users
router.get("/users", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
});

// GET /api/admin/products - Get all products
router.get("/products", protect, adminOnly, async (req, res) => {
  try {
    const products = await Product.find().populate("createdBy", "name email");
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: "Error fetching products", error: err.message });
  }
});

// GET /api/admin/orders - Get all orders
router.get("/orders", protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("buyer", "name email")
      .populate("products.productId", "name");

    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: "Error fetching orders", error: err.message });
  }
});

// DELETE /api/admin/users/:id - Delete user
router.delete("/users/:id", protect, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user", error: err.message });
  }
});

// DELETE /api/admin/products/:id - Delete product
router.delete("/products/:id", protect, adminOnly, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete product", error: err.message });
  }
});

export default router;
