const express = require("express");

console.log("authRoute.js file is loaded");
const router = express.Router();
const authController = require("../controller/authController");
const { multerMiddleware } = require("../config/clouldinaryConfig");
const authMiddleware = require("../middleWare/authMiddleware");
router.post("/send-otp", authController.sendOtp);
router.post("/verify-otp", authController.verifyOtp);
router.put("/update-profile", authMiddleware, multerMiddleware,authController.updateProfile);
router.get("/logout", authMiddleware, authController.logout);
router.get('/getme', authMiddleware, authController.checkAuthenticated);

router.get('/getallusers', authMiddleware, authController.getAllUsers);

module.exports = router;