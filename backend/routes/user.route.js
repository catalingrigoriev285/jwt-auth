const router = require("express").Router();
const {
    createUser,
    loginUser,
    logoutUser,
    refreshToken,
    getCurrentUser,
} = require("../controllers/user.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const { authLimiter } = require("../middleware/rateLimiter.middleware");
const {
    registerValidation,
    loginValidation,
    handleValidationErrors,
} = require("../middleware/validation.middleware");

// Public routes with rate limiting
router.post(
    "/register",
    authLimiter,
    registerValidation,
    handleValidationErrors,
    createUser
);

router.post(
    "/login",
    authLimiter,
    loginValidation,
    handleValidationErrors,
    loginUser
);

router.post("/refresh", refreshToken);

// Protected routes
router.post("/logout", verifyToken, logoutUser);
router.get("/me", verifyToken, getCurrentUser);

module.exports = router;