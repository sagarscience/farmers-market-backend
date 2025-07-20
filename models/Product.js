import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    price: Number,
    quantity: Number,
    imageUrl: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: String,
        rating: Number,
        comment: String,
        createdAt: { type: Date, default: Date.now },
      }
    ],
    averageRating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
  },


  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
