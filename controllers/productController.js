import Product from "../models/Product.js";

// Add a new product
export const addProduct = async (req, res) => {
  try {
    const product = new Product({
      ...req.body,
      createdBy: req.user.id,
    });

    const saved = await product.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({
      message: "Failed to add product",
      error: err.message,
    });
  }
};

// Get all products created by the logged-in farmer
export const getFarmerProducts = async (req, res) => {
  try {
    const products = await Product.find({ createdBy: req.user.id });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error: error.message });
  }
};

// Update a product (only if created by the logged-in farmer)
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      req.body,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found or unauthorized" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Error updating product", error: error.message });
  }
};

// Delete a product (only if created by the logged-in farmer)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found or unauthorized" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error: error.message });
  }
};

// Get all products (public view for buyers/admins)
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("createdBy", "name");
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: "Error fetching products", error: err.message });
  }
};
