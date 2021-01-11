const { Router } = require("express");
const router = Router();
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_KEY);
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Plan = require("../models/plan");
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
const isNew = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    res.status(400).json({ err: "user already exists" });
  } else {
    next();
  }
};
router.post("/checkout", isNew, async (req, res) => {
  try {
    const { payment_method, email, plan } = req.body;
    const customer = await stripe.customers.create({
      payment_method,
      email,
      invoice_settings: {
        default_payment_method: payment_method,
      },
    });
    const { api_id } = await Plan.findOne({ name: plan });
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [
        {
          plan: api_id,
        },
      ],
      expand: ["latest_invoice.payment_intent"],
    });
    const { latest_invoice, id } = subscription;
    const { payment_intent } = latest_invoice;

    res.status(200).json({
      status: payment_intent.status,
      client_secret: payment_intent.client_secret,
      customer_id: customer.id,
      subscription_id: id,
    });
  } catch (err) {
    res.status(400).json(err.message);
  }
});
router.get("/cancel", verification, async (req, res) => {
  const { subscription_id } = res.locals.user;
  try {
    const { status } = await stripe.subscriptions.del(subscription_id);
    if (status === "canceled") {
      const deletedUser = await User.findOneAndRemove({ subscription_id });
    }
    res.status(200).json({ status });
  } catch (err) {
    res.status(400).json(err.message);
  }
});
router.post("/upgrade", verification, async (req, res) => {
  const { subscription_id, _id } = res.locals.user;
  const { newPlan } = req.body;
  try {
    const { api_id } = await Plan.findOne({ name: newPlan });
    const subscription = await stripe.subscriptions.retrieve(subscription_id);
    const updateSubscription = await stripe.subscriptions.update(
      subscription_id,
      {
        cancel_at_period_end: false,
        items: [
          {
            id: subscription.items.data[0].id,
            price: api_id,
          },
        ],
      }
    );
    const { status } = updateSubscription;
    if (status === "active") {
      const updateUser = await User.findByIdAndUpdate(
        _id,
        { plan: newPlan },
        { new: true }
      );
      res.status(200).json({ status });
    } else {
      res.status(404).send("upgrade failed");
    }
  } catch (err) {
    res.status(400).json(err.message);
  }
});
module.exports = router;
