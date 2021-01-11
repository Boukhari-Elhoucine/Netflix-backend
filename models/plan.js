const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const planSchema = new Schema({
  price: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  quality: {
    type: String,
    required: true,
  },
  resolution: {
    type: String,
    required: true,
  },
  screen: {
    type: Number,
    required: true,
  },
  api_id: {
    type: String,
    required: true,
  },
});

const Plan = mongoose.model("plan", planSchema);
module.exports = Plan;
