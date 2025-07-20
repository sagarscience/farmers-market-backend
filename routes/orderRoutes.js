import express from "express";
import Order from "../models/Order.js";
import { protect, adminOrFarmerOnly } from "../middleware/authMiddleware.js";
import { generateInvoice } from "../utils/generateInvoice.js";
import Product from "../models/Product.js";

const router = express.Router();

// ✅ Create Order
router.post("/", protect, async (req, res) => {
  try {
    const { cart, paymentId, total } = req.body;
    for (const item of cart) {
      const product = await Product.findById(item._id);
      if (!product || product.quantity < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${item.name}. Available: ${product?.quantity || 0}`,
        });
      }
    }

    const order = new Order({
      buyer: req.user.id,
      products: cart.map((item) => ({
        productId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        createdBy: item.createdBy,
      })),
      totalAmount: total,
      paymentId,
    });

    const saved = await order.save();
    // ✅ Reduce stock for each product
    for (const item of cart) {
      await Product.findByIdAndUpdate(
        item._id,
        { $inc: { quantity: -item.quantity } },
        { new: true }
      );
    }

    res.status(201).json({ message: "Order placed successfully", order: saved });
  } catch (err) {
    console.error("❌ Order save failed", err);
    res.status(500).json({ message: "Failed to save order" });
  }
});

// ✅ Update Tracking (Farmer/Admin)
router.patch("/:id/track", protect, adminOrFarmerOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (req.user.role === "farmer") {
      const ownsProduct = order.products.some(
        (p) => p.createdBy?.toString() === req.user.id
      );
      if (!ownsProduct) {
        return res.status(403).json({ message: "Forbidden for this order" });
      }
    }

    order.trackingHistory.push({ status });
    order.status = status;
    await order.save();

    const updatedOrder = await Order.findById(order._id).populate("buyer", "name email");

    if (req.user.role === "farmer") {
      const filtered = updatedOrder.products.filter(
        (p) => p.createdBy?.toString() === req.user.id
      );
      return res.json({
        message: "Tracking updated",
        order: {
          ...updatedOrder.toObject(),
          products: filtered,
        },
      });
    }

    res.json({ message: "Tracking updated", order: updatedOrder });
  } catch (err) {
    console.error("Tracking update failed:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get Orders for Logged-in Buyer
router.get("/my", protect, async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("❌ Failed to fetch orders:", err);
    res.status(500).json({ message: "Failed to load orders" });
  }
});

// ✅ Get Invoice PDF
router.get("/:id/invoice", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("buyer", "name email");

    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.buyer._id.toString() !== req.user.id)
      return res.status(403).json({ message: "Forbidden" });

    generateInvoice(res, order);
  } catch (err) {
    console.error("Invoice generation failed:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Orders for Farmer Products
router.get("/farmer", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ "products.createdBy": userId })
      .populate("buyer", "name email")
      .sort({ createdAt: -1 });

    const filtered = orders.map((order) => ({
      ...order.toObject(),
      products: order.products.filter((p) => p.createdBy?.toString() === userId),
    }));

    res.json(filtered);
  } catch (err) {
    console.error("Failed to fetch farmer orders:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Single Order by ID (for tracking)
router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("buyer", "name email");

    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.buyer._id.toString() !== req.user.id)
      return res.status(403).json({ message: "Access denied" });

    res.json(order);
  } catch (err) {
    console.error("❌ Error fetching order:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
