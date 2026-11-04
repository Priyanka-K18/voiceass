const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String },
  loyaltyPoints: { type: Number, default: 0 },
  totalSpending: { type: Number, default: 0 },
  purchaseHistory: [
    {
      billId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bill' },
      date: { type: Date, default: Date.now },
      amount: { type: Number }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
