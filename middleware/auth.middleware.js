const jwt = require("jsonwebtoken");
require("dotenv").config();

const auth = (req, res, next) => {
  const token = req.headers?.authorization?.split(" ")[1];

  try {
    if (!token) {
      throw new Error("Unauthorized, please login");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!decoded) {
      throw new Error("Unauthorized");
    }

    req.user = {
      _id: decoded.authorId,
      name: decoded.author,
    };

    next();
  } catch (error) {
    console.error("Error verifying token:", error.message);
    res.status(401).json({ error: error.message });
  }
};

module.exports ={ auth};
