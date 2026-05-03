import express from "express";
import {
  checkEmail,
  signup,
  sendCode,
  verifyCode,
  login,
  refreshToken,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.get("/check-email", checkEmail);
router.post("/signup", signup);
router.post("/send-code", sendCode);
router.post("/verify-code", verifyCode);
router.post("/login", login);
router.post("/refresh-token", refreshToken);

export default router;
