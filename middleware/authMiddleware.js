import jwt from "jsonwebtoken";

// Middleware to protect private routes
export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, name, email, role, iat, exp }
    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

// Middleware to allow only admin or farmer roles
export const adminOrFarmerOnly = (req, res, next) => {
  if (req.user?.role === "admin" || req.user?.role === "farmer") {
    return next();
  }
  res.status(403).json({ message: "Access denied. Admin or Farmer only." });
};
