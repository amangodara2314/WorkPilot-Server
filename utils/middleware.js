const jwt = require("jsonwebtoken");
const authMiddleware = async (req, res, next) => {
  const authToken = req.headers.authorization;
  if (!authToken) {
    res.status(401).json({ message: "Unauthorized" });
  }
  const token = authToken.startsWith("Bearer ")
    ? authToken.split(" ")[1]
    : authToken;

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decodedToken.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = { authMiddleware };
