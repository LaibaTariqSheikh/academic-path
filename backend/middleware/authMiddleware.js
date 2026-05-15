const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_dev_only";

/*
==================================================
VERIFY JWT TOKEN
==================================================
*/
function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      return res.status(401).json({
        error: "Authentication required",
      });
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        error: "Invalid authorization format",
      });
    }

    const token = parts[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    console.error("JWT auth error:", error.message);

    return res.status(401).json({
      error: "Invalid or expired token",
    });
  }
}

/*
==================================================
ROLE CHECK
Example:
router.get("/admin", authenticateToken, requireRole("admin"), ...)
router.get("/multi", authenticateToken, requireRole(["admin", "guide"]), ...)
==================================================
*/
function requireRole(roles) {
  return (req, res, next) => {
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!req.user) {
      return res.status(401).json({
        error: "Authentication required",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: "You are not allowed to perform this action",
      });
    }

    next();
  };
}

/*
==================================================
SELF ACCESS OR ROLE ACCESS
Example:
Student can access own data.
Admin/Guide can access if allowed.
==================================================
*/
function allowSelfOrRoles(paramName, roles = []) {
  return (req, res, next) => {
    const targetId = Number(req.params[paramName]);
    const currentUserId = Number(req.user?.id);

    if (!req.user) {
      return res.status(401).json({
        error: "Authentication required",
      });
    }

    if (targetId === currentUserId) {
      return next();
    }

    if (roles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({
      error: "You are not allowed to access this data",
    });
  };
}

/*
==================================================
OPTIONAL TOKEN
Useful for guest routes if needed later.
Does not block request if token is missing.
==================================================
*/
function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      return next();
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return next();
    }

    const token = parts[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;
    return next();
  } catch {
    return next();
  }
}

module.exports = {
  authenticateToken,
  requireRole,
  allowSelfOrRoles,
  optionalAuth,
};