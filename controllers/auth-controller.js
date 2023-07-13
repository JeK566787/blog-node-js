const User = require("../models/user");
const Role = require("../models/role");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const { secret } = require("../helpers/config");

const generateAccessToken = (id, roles) => {
  const payload = {
    id,
    roles,
  };
  return jwt.sign(payload, secret, { expiresIn: "24h" });
};

const generateRefreshToken = (userId) => {
  const payload = {
    userId,
  };
  const options = {
    expiresIn: "30d", // Установите желаемый срок действия refresh token
  };
  return jwt.sign(payload, secret, options);
};

const verifyRefreshToken = (refreshToken) => {
  try {
    const decodedData = jwt.verify(refreshToken, secret);
    return decodedData;
  } catch (e) {
    return null;
  }
};

class authController {
  async registration(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ message: "Registration mistake", errors });
      }
      const { username, password } = req.body;
      const candidate = await User.findOne({ username });
      if (candidate) {
        return res.status(400).json({ message: "User already exists" });
      }
      const hashPassword = bcrypt.hashSync(password, 7);
      const userRole = await Role.findOne({ value: "USER" });
      const user = new User({
        username,
        password: hashPassword,
        roles: [userRole.value],
      });
      await user.save();

      const message = "User logged up";
      return res.redirect(`/?message=${encodeURIComponent(message)}`);
      // return res.json({ message: "User logged up" });
    } catch (e) {
      console.log(e);
      res.status(400).json({ message: "Registration error" });
    }
  }

  async login(req, res) {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });
      if (!user) {
        return res
          .status(400)
          .json({ message: `User ${username} wasn't found` });
      }
      const validPassword = bcrypt.compareSync(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ message: `Wrong password` });
      }
      const token = generateAccessToken(user._id, user.roles);
      const refreshToken = generateRefreshToken(user._id);

      if (req.path === "/enter") {
        res.clearCookie("token");
        res.clearCookie("refreshToken");
      } else {
        res.cookie("token", token, { maxAge: 86400, httpOnly: true });
        res.cookie("refreshToken", refreshToken, {
          maxAge: 30 * 24 * 60 * 60 * 1000,
          httpOnly: true,
        });
      }
      return res.redirect("/");
    } catch (e) {
      console.log(e);
      res.status(400).json({ message: "Login error" });
    }
  }

  async getUsers(req, res) {
    try {
      const token = req.cookies.token;
      const refreshToken = req.cookies.refreshToken;

      if (!token && refreshToken) {
        const newAccessToken = verifyRefreshToken(refreshToken);
        if (!newAccessToken) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        res.cookie("token", newAccessToken);
      } else if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      res.header("Authorization", `Bearer ${token}`);

      const users = await User.find();
      res.json(users);
    } catch (e) {}
  }
}

module.exports = new authController();
