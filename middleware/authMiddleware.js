import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // decoded = { id, role, iat, exp }
    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

export const adminOrFarmerOnly = (req, res, next) => {
  if (req.user && (req.user.role === "admin" || req.user.role === "farmer")) {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admin or Farmer only." });
  }
};
