import Product from "../models/Product.js";

export const addProduct = async (req, res) => {
  try {
    const product = new Product({
      ...req.body,
      createdBy: req.user.id,
    });

    const saved = await product.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: "Failed to add product", error: err.message });
  }
};

// GET /api/products/my
export const getFarmerProducts = async (req, res) => {
    try {
        const products = await Product.find({ createdBy: req.user.id });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: "Error fetching products" });
    }
};

// PUT /api/products/:id
export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.user.id },
            req.body,
            { new: true }
        );

        if (!product) return res.status(404).json({ message: "Product not found" });

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: "Error updating product" });
    }
};

// DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findOneAndDelete({
            _id: req.params.id,
            createdBy: req.user.id,
        });

        if (!product) return res.status(404).json({ message: "Product not found" });

        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting product" });
    }
};

export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().populate("createdBy", "name");
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: "Error fetching products" });
    }
};
