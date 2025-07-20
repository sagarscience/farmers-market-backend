import express from "express";
import {
    addProduct,
    getFarmerProducts,
    getAllProducts,
    updateProduct,
    deleteProduct,
} from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";
import Product from "../models/Product.js";

const router = express.Router();

router.get("/", getAllProducts);                   // GET /api/products (for buyers)
router.post("/", protect, addProduct);             // POST /api/products (for farmers)
router.get("/my", protect, getFarmerProducts);     // GET /api/products/my
router.put("/:id", protect, updateProduct);        // PUT /api/products/:id
router.delete("/:id", protect, deleteProduct);     // DELETE /api/products/:id
// routes/productRoutes.js
router.get("/", async (req, res) => {
    const products = await Product.find().limit(6); // Limit to top 6 offerings
    res.json(products);
});

// POST /api/products/:id/review
router.post("/:id/review", protect, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const product = await Product.findById(req.params.id);

        if (!product) return res.status(404).json({ message: "Product not found" });

        const alreadyReviewed = product.reviews.find(
            (r) => r.user.toString() === req.user.id
        );

        if (alreadyReviewed) {
            // Update existing review
            alreadyReviewed.rating = rating;
            alreadyReviewed.comment = comment;
            alreadyReviewed.createdAt = new Date();
        } else {
            // Add new review
            product.reviews.push({
                user: req.user.id,
                name: req.user.name,
                rating: Number(rating),
                comment,
            });
        }

        // Recalculate rating
        product.numReviews = product.reviews.length;
        product.averageRating =
            product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.numReviews;

        await product.save();

        res.json({ message: "Review submitted successfully", product });
    } catch (err) {
        console.error("Review error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
