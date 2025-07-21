import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        createdBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true, // ✅ Ensures every product links back to a farmer
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentId: {
      type: String,
      required: true,
      index: true, // for easier lookups on invoice/payment validation
    },
    status: {
      type: String,
      enum: ["Placed", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Placed",
    },
    trackingHistory: [
      {
        status: {
          type: String,
          enum: ["Placed", "Processing", "Shipped", "Delivered", "Cancelled"],
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true } // Adds createdAt and updatedAt automatically
);

export default mongoose.model("Order", orderSchema);
