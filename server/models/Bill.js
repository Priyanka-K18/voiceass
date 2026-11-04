const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  billNumber: { type: String, required: true, unique: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  customerName: { type: String }, // fallback if no customer ID
  customerPhone: { type: String },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      productName: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      total: { type: Number, required: true }
    }
  ],
  subtotal: { type: Number, required: true },
  gstPercentage: { type: Number, default: 18 },
  gstAmount: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['Cash', 'Card', 'UPI'], default: 'Cash' },
  paymentStatus: { type: String, enum: ['Paid', 'Pending', 'Failed'], default: 'Paid' },
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Cashier who made the bill
}, { timestamps: true });

module.exports = mongoose.model('Bill', billSchema);
