const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  price: { type: Number, required: true },
  supplier: { type: String },
  barcode: { type: String },
  expiryDate: { type: Date },
  productImage: { type: String }, // URL or path
  stockStatus: { type: String, enum: ['In Stock', 'Low Stock', 'Out of Stock'], default: 'In Stock' },
}, { timestamps: true });

// Pre-save hook to update stock status based on quantity
productSchema.pre('save', function() {
  if (this.quantity === 0) {
    this.stockStatus = 'Out of Stock';
  } else if (this.quantity < 10) {
    this.stockStatus = 'Low Stock';
  } else {
    this.stockStatus = 'In Stock';
  }
});

module.exports = mongoose.model('Product', productSchema);
