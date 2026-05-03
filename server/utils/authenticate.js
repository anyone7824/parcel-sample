import jwt from "jsonwebtoken";

const authenticate = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token)
    return res
      .sendStatus(401)
      .json({ error: "Unauthorized", message: "Access token is required" });
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET_TOKEN);

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Access token has expired",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(403).json({
        error: "Forbidden",
        message: "Invalid access token",
      });
    }

    return res.status(403).json({
      error: "Forbidden",
      message: "Authentication failed",
    });
  }
};

export default authenticate;
