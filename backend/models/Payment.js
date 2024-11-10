const mongoose = require("mongoose");

// Define Payment schema
const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Link to User who made the payment
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  provider: { type: String, required: true },
  accountInfo: { type: String, required: true },
  swiftCode: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Payment", paymentSchema);
