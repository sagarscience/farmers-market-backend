import express from "express";
import { loginUser, registerUser } from "../controllers/authController.js";

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post("/register", registerUser);

// @route   POST /api/auth/login
// @desc    Login user and return JWT
// @access  Public
router.post("/login", loginUser);

export default router;
