import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// ✅ Ensure Razorpay credentials exist
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn("⚠️ Razorpay keys not configured in environment variables.");
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @route   POST /api/payment/create-order
// @desc    Create Razorpay order
// @access  Public
router.post("/create-order", async (req, res) => {
  const { amount } = req.body;

  if (!amount || isNaN(amount)) {
    return res.status(400).json({ message: "Invalid amount" });
  }

  try {
    const options = {
      amount: parseInt(amount) * 100, // amount in paise
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    console.log("✅ Razorpay order created:", order.id);

    res.status(201).json(order);
  } catch (err) {
    console.error("❌ Razorpay order creation failed:", err.message);
    res.status(500).json({ message: "Order creation failed", error: err.message });
  }
});

// @route   POST /api/payment/verify
// @desc    Verify Razorpay payment signature
// @access  Public (optional for now)
router.post("/verify", (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ message: "Missing payment fields" });
  }

  try {
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = hmac.digest("hex");

    if (digest === razorpay_signature) {
      console.log("✅ Payment verified");
      return res.status(200).json({ message: "Payment verified" });
    } else {
      console.warn("❌ Signature mismatch");
      return res.status(400).json({ message: "Invalid signature" });
    }
  } catch (err) {
    console.error("❌ Payment verification error:", err.message);
    res.status(500).json({ message: "Verification failed", error: err.message });
  }
});

export default router;
