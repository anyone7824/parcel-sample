import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import nodeCache from "node-cache";
import transporter from "../config/mail.js";
import dotenv from "dotenv";

dotenv.config();

const vfyCodeCache = new nodeCache({ stdTTL: 300 });

export const checkEmail = async (email) => {
  if (!email) {
    return { success: false, status: 400, message: "Missing email data" };
  }

  const emailResult = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  return {
    success: true,
    status: 200,
    exists: emailResult.rowCount > 0,
  };
};

export const sendCode = async ({ email, type }) => {
  if (!email)
    return { success: false, status: 400, message: "Missing email address." };

  if (type !== "VERIFY_EMAIL" && type !== "FORGOT_PASSWORD") {
    return { success: false, status: 400, message: "Invalid verification type." };
  }

  let subject = "";
  let content = "";

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const cacheKey = `${type} : ${email}`;

  vfyCodeCache.set(cacheKey, code, 300);

  if (type === "VERIFY_EMAIL") {
    subject = "Verification Code for Your Email";
    content = `<div>Code for your email verification : <b>${code}</b></div>`;
  }

  if (type === "FORGOT_PASSWORD") {
    subject = "Verification Code for Your Password Reset";
    content = `<div>Code for your password reset : <b>${code}</b></div>`;
  }

  const info = await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject,
    html: content,
  });

  if (!info.messageId)
    return {
      success: false,
      status: 503,
      message: "Failed to send verification code.",
    };

  return {
    success: true,
    status: 200,
    message: "Verification code sent successfully. Please check your inbox.",
  };
};

export const verifyCode = async ({ email, code, type }) => {
  if (!email || !code || !type)
    return { success: false, status: 400, message: "Missing fields" };

  const cacheKey = `${type} : ${email}`;
  const storedVfyCode = vfyCodeCache.get(cacheKey);

  if (!storedVfyCode)
    return {
      success: false,
      status: 401,
      message: "Token expired or missing.",
    };

  if (code !== storedVfyCode)
    return {
      success: false,
      status: 401,
      message: "Invalid verification code.",
    };

  vfyCodeCache.del(cacheKey);

  return {
    success: true,
    status: 200,
    message: "Email verified successfully.",
  };
};

export const signup = async ({ fullName, dob, email, password }) => {
  if (!fullName || !dob || !email || !password)
    return { success: false, status: 400, message: "Missing fields" };
  try {
    const saltedRounds = 15;
    const hashedPassword = await bcrypt.hash(password, saltedRounds);
    const signupResult = await pool.query(
      "INSERT INTO users (name, email, password, dob) values ($1, $2, $3, $4)",
      [fullName, email, hashedPassword, dob],
    );
    if (signupResult.rowCount === 1) {
      return {
        success: true,
        status: 201,
        message: "Account Created Successfully.",
      };
    }

    return {
      success: false,
      status: 500,
      message: "Falied to create account.",
    };
  } catch (error) {
    if (error.code === "23505") {
      return {
        success: false,
        status: 409,
        message: "Email already exists",
      };
    }
    throw error;
  }
};

export const login = async ({ identifier, password }) => {
  const result = await pool.query(
    `SELECT * FROM users WHERE email = $1 OR name = $1`,
    [identifier],
  );
  if (result?.rowCount !== 1)
    return { success: false, status: 404, message: "User not found." };

  const user = result?.rows[0];

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    return { success: false, status: 401, message: "Invalid Password." };

  const accessToken = generateAccessToken(identifier);
  const refreshToken = generateRefreshToken(identifier);

  await pool.query(
    "UPDATE users SET refreshtoken = $1 WHERE name = $2 OR email = $2",
    [refreshToken, identifier],
  );
  return {
    success: true,
    message: "Login sucessful :)",
    name: user.name,
    token: accessToken,
    refreshToken: refreshToken,
  };
};

export const refreshToken = async (refreshToken) => {
  if (!refreshToken) return { status: 403, message: "Missing refresh token." };

  const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET_TOKEN);
  const result = await pool.query(
    "SELECT * FROM users WHERE name = $1 OR email = $1",
    [decoded.user],
  );
  if (result?.rowCount === 0) return { status: 403, message: "User not found" };

  if (result?.rows[0]?.refreshtoken !== refreshToken)
    return { status: 403, message: "No refresh token." };

  const newAccessToken = generateAccessToken(decoded.user);
  return {
    message: "New access token generated successfully",
    status: 200,
    accessToken: newAccessToken,
  };
};
