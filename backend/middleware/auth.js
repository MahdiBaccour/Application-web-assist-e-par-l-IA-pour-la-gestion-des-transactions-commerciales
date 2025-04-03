import jwt from "jsonwebtoken"; // Import as default
const { verify } = jwt; // Destructure verify function

const auth = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).send({ success: false, message: "No token provided" });
  }

  verify(token, process.env.TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(401).send({ success: false, message: "Invalid token" });
    }
    req.user = user;
    next();
  });
};

// Middleware to check for owner role
const isOwner = (req, res, next) => {
  if (req.user.role !== "owner") {
    return res.status(403).send({ success: false, message: "Requires owner role" });
  }
  next();
};

// Middleware to check for employee role
const isEmployee = (req, res, next) => {
  if (req.user.role !== "employee") {
    return res.status(403).send({ success: false, message: "Requires employee role" });
  }
  next();
};

// Middleware to check for client role
const isClient = (req, res, next) => {
  if (req.user.role !== "client") {
    return res.status(403).send({ success: false, message: "Requires client role" });
  }
  next();
};

// Middleware to check for supplier role
const isSupplier = (req, res, next) => {
  if (req.user.role !== "supplier") {
    return res.status(403).send({ success: false, message: "Requires supplier role" });
  }
  next();
};

const middleware = { auth, isOwner, isEmployee, isClient, isSupplier };

export default middleware;