import * as authService from "../services/auth.service.js";

export const checkEmail = async (req, res) => {
  try {
    const result = await authService.checkEmail(req.query.email);
    console.log(req.query.email);
    return res.status(result.status).send(result);
  } catch (error) {
    return res.status(500).send({ message: "Server Error" });
  }
};

export const signup = async (req, res) => {
  try {
    const result = await authService.signup(req.body);
    return res.status(result.status).send(result);
  } catch (error) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

export const sendCode = async (req, res) => {
  try {
    const result = await authService.sendCode(req.body);
    return res.status(result.status).send(result);
  } catch (error) {
    return res.status(500).send({ message: "Internal Server Error." });
  }
};

export const verifyCode = async (req, res) => {
  try {
    const result = await authService.verifyCode(req.body);
    return res.status(result.status).send(result);
  } catch (error) {
    return res.status(500).send({ message: "Internal Server Error." });
  }
};

export const login = async (req, res) => {
  try {
    const result = await authService.login(req.body);
    if (!result.success) return res.status(result.status).send(result);

    res.cookie("refresh-token", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies["refresh-token"];
    const result = await authService.refreshToken(refreshToken);

    return res.status(result.status).send(result);
  } catch (error) {
    if (error.name === "TokenExpiredError")
      return res
        .status(401)
        .send({ success: false, message: "Refresh Token Expired." });

    if (error.name === "JsonWebTokenError")
      return res
        .status(403)
        .send({ success: false, message: "Invalid Refresh Token" });

    return res
      .status(500)
      .send({ success: false, message: "Internal Server Error" });
  }
};
