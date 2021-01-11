const express = require("express");
const router = express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const maxAge = 24 * 3600;
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: maxAge });
};
router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.cookie("token", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json(err.message);
  }
});
router.post("/signup", async (req, res) => {
  const {
    email,
    password,
    customer_id,
    plan,
    firstName,
    lastName,
    subscription_id,
  } = req.body;
  try {
    const user = await User.create({
      email,
      password,
      customer_id,
      plan,
      firstName,
      lastName,
      subscription_id,
    });
    const token = createToken(user._id);
    res.cookie("token", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json({ user });
  } catch (err) {
    res.status(500).json(err.message);
  }
});
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.status(200).send("logged out");
});

module.exports = router;
