const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/bills
// @desc    Create new bill and update inventory
router.post('/', async (req, res) => {
  try {
    const { customerId, customerName, customerPhone, items, paymentMethod } = req.body;

    if (items && items.length === 0) {
      return res.status(400).json({ error: 'No order items' });
    }

    // Calculate totals and check inventory
    let subtotal = 0;
    const processedItems = [];

    for (let item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ error: `Product not found: ${item.productName}` });
      }
      if (product.quantity < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      }

      // Deduct stock
      product.quantity -= item.quantity;
      await product.save();

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;
      processedItems.push({
        productId: product._id,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal
      });
    }

    const gstPercentage = 18; // Default 18% GST
    const gstAmount = (subtotal * gstPercentage) / 100;
    const totalAmount = subtotal + gstAmount;
    
    // Generate Bill Number
    const count = await Bill.countDocuments();
    const billNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const bill = new Bill({
      billNumber,
      customerId: customerId || null,
      customerName,
      customerPhone,
      items: processedItems,
      subtotal,
      gstPercentage,
      gstAmount,
      totalAmount,
      paymentMethod,
      // issuedBy: req.user._id // Will add once auth is fully wired from frontend
    });

    const createdBill = await bill.save();

    // Update customer history if customer exists
    if (customerId) {
      const customer = await Customer.findById(customerId);
      if (customer) {
        customer.totalSpending += totalAmount;
        // 1 point for every $10 spent
        customer.loyaltyPoints += Math.floor(totalAmount / 10);
        customer.purchaseHistory.push({
          billId: createdBill._id,
          amount: totalAmount
        });
        await customer.save();
      }
    }

    res.status(201).json(createdBill);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create bill' });
  }
});

// @route   GET /api/bills
// @desc    Get all bills
router.get('/', async (req, res) => {
  try {
    const bills = await Bill.find().sort({ createdAt: -1 });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bills' });
  }
});

module.exports = router;
