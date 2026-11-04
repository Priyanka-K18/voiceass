const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/customers
// @desc    Get all customers
router.get('/', async (req, res) => {
  try {
    const search = req.query.search;
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      };
    }
    const customers = await Customer.find(query).sort({ totalSpending: -1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// @route   POST /api/customers
// @desc    Create a customer
router.post('/', async (req, res) => {
  try {
    const { name, phone, email } = req.body;
    const customerExists = await Customer.findOne({ phone });
    if (customerExists) {
      return res.status(400).json({ error: 'Customer with this phone already exists' });
    }
    const customer = await Customer.create({ name, phone, email });
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// @route   GET /api/customers/:id
// @desc    Get customer by ID
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).populate('purchaseHistory.billId');
    if (customer) {
      res.json(customer);
    } else {
      res.status(404).json({ error: 'Customer not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

module.exports = router;
