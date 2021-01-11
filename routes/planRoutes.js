const { Router } = require("express");
const Plan = require("../models/plan");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const router = Router();
require("dotenv").config();
const verification = (req, res, next) => {
  const token = req.cookies.token;
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      res.status(403).json({ err: "not authorized" });
    } else {
      const user = await User.findById(decoded.id);
      res.locals.user = user;
      next();
    }
  });
};
router.get("/plan", (req, res) => {
  Plan.find().then((result) => res.status(200).json(result));
});
router.get("/profile", verification, (req, res) => {
  const { plan } = res.locals.user;
  Plan.findOne({ name: plan })
    .then((response) => res.status(200).json({ response }))
    .catch((err) => res.status(401).json(err.message));
});
router.post("/change", (req, res) => {
  const { current } = req.body;
  Plan.find({ name: { $ne: current } })
    .then((response) => res.status(200).json({ response }))
    .catch((err) => res.status(404).json(err.message));
});
module.exports = router;
