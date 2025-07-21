import express from "express";
import {
  addProduct,
  getFarmerProducts,
  getAllProducts,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// @route   GET /api/products
// @desc    Fetch all products (buyer view)
// @access  Public
router.get("/", getAllProducts);

// @route   POST /api/products
// @desc    Add new product (farmer only)
// @access  Protected
router.post("/", protect, addProduct);

// @route   GET /api/products/my
// @desc    Fetch farmer's own products
// @access  Protected
router.get("/my", protect, getFarmerProducts);

// @route   PUT /api/products/:id
// @desc    Update a product (farmer only)
// @access  Protected
router.put("/:id", protect, updateProduct);

// @route   DELETE /api/products/:id
// @desc    Delete a product (farmer only)
// @access  Protected
router.delete("/:id", protect, deleteProduct);

// @route   POST /api/products/:id/review
// @desc    Add or update product review (buyer)
// @access  Protected
router.post("/:id/review", protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user.id
    );

    if (alreadyReviewed) {
      alreadyReviewed.rating = rating;
      alreadyReviewed.comment = comment;
      alreadyReviewed.createdAt = new Date();
    } else {
      product.reviews.push({
        user: req.user.id,
        name: req.user.name,
        rating: Number(rating),
        comment,
      });
    }

    product.numReviews = product.reviews.length;
    product.averageRating =
      product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.numReviews;

    await product.save();

    res.json({ message: "Review submitted successfully", product });
  } catch (err) {
    console.error("❌ Review error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});


// @route   GET /api/products/featured
// @desc    Get top 6 featured products
// @access  Public
router.get("/featured", async (req, res) => {
  try {
    const products = await Product.find().limit(6);
    res.json(products);
  } catch (err) {
    console.error("❌ Failed to fetch featured:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
