import express from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { protect, adminOrFarmerOnly } from "../middleware/authMiddleware.js";
import { generateInvoice } from "../utils/generateInvoice.js";

const router = express.Router();

// @route   POST /api/orders
// @desc    Place an order
// @access  Protected
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

    const savedOrder = await order.save();

    for (const item of cart) {
      await Product.findByIdAndUpdate(
        item._id,
        { $inc: { quantity: -item.quantity } },
        { new: true }
      );
    }

    res.status(201).json({ message: "Order placed successfully", order: savedOrder });
  } catch (err) {
    console.error("❌ Order placement failed:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   PATCH /api/orders/:id/track
// @desc    Update tracking status (farmer/admin only)
// @access  Protected
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
        return res.status(403).json({ message: "Forbidden: Not your order" });
      }
    }

    order.status = status;
    order.trackingHistory.push({ status });
    await order.save();

    const updatedOrder = await Order.findById(order._id).populate("buyer", "name email");

    // Filter products if user is farmer
    if (req.user.role === "farmer") {
      const filteredProducts = updatedOrder.products.filter(
        (p) => p.createdBy?.toString() === req.user.id
      );
      return res.json({
        message: "Tracking updated",
        order: {
          ...updatedOrder.toObject(),
          products: filteredProducts,
        },
      });
    }

    res.json({ message: "Tracking updated", order: updatedOrder });
  } catch (err) {
    console.error("❌ Tracking update failed:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/orders/my
// @desc    Get logged-in buyer’s order history
// @access  Protected
router.get("/my", protect, async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("❌ Failed to load buyer orders:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/orders/farmer
// @desc    Get orders for products created by logged-in farmer
// @access  Protected
router.get("/farmer", protect, async (req, res) => {
  try {
    const farmerId = req.user.id;
    const orders = await Order.find({ "products.createdBy": farmerId })
      .populate("buyer", "name email")
      .sort({ createdAt: -1 });

    const filteredOrders = orders.map((order) => ({
      ...order.toObject(),
      products: order.products.filter(
        (p) => p.createdBy?.toString() === farmerId
      ),
    }));

    res.json(filteredOrders);
  } catch (err) {
    console.error("❌ Failed to load farmer orders:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order by ID (only for buyer)
// @access  Protected
router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("buyer", "name email");

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.buyer._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(order);
  } catch (err) {
    console.error("❌ Failed to fetch order:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/orders/:id/invoice
// @desc    Generate and return PDF invoice
// @access  Protected
router.get("/:id/invoice", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("buyer", "name email");

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.buyer._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    generateInvoice(res, order);
  } catch (err) {
    console.error("❌ Invoice generation failed:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
