require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart_inventory';

const initialProducts = [
  { productId: 'P001', name: 'Rice Bags', category: 'Grocery', quantity: 50, price: 20, supplier: 'AgriCorp', productImage: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=200&h=200' },
  { productId: 'P002', name: 'Pepsi', category: 'Beverages', quantity: 100, price: 2, supplier: 'PepsiCo', productImage: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?auto=format&fit=crop&q=80&w=200&h=200' },
  { productId: 'P003', name: 'Milk Packets', category: 'Dairy', quantity: 30, price: 1.5, supplier: 'DairyFarm', productImage: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=200&h=200' },
  { productId: 'P004', name: 'Sugar', category: 'Grocery', quantity: 40, price: 3, supplier: 'SweetSurg', productImage: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?auto=format&fit=crop&q=80&w=200&h=200' },
  { productId: 'P005', name: 'Soap', category: 'Personal Care', quantity: 80, price: 1, supplier: 'CleanCo', productImage: 'https://images.unsplash.com/photo-1600857062241-98e5dba7f214?auto=format&fit=crop&q=80&w=200&h=200' },
  { productId: 'P006', name: 'Laptop', category: 'Electronics', quantity: 15, price: 999, supplier: 'TechTronics', productImage: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=200&h=200' },
  { productId: 'P007', name: 'Keyboard', category: 'Electronics', quantity: 25, price: 50, supplier: 'TechTronics', productImage: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=200&h=200' },
  { productId: 'P008', name: 'Mobile Phones', category: 'Electronics', quantity: 45, price: 699, supplier: 'MobileWorld', productImage: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=200&h=200' },
];

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB. Seeding database...');
    
    // Seed Products
    await Product.deleteMany({});
    for (const product of initialProducts) {
      const p = new Product(product);
      await p.save();
    }
    
    // Seed Users
    const bcrypt = require('bcryptjs');
    const User = require('./models/User');
    await User.deleteMany({});
    
    const salt = await bcrypt.genSalt(10);
    const adminPass = await bcrypt.hash('admin123', salt);
    const cashierPass = await bcrypt.hash('cashier123', salt);
    
    await User.create([
      { name: 'Admin Owner', username: 'admin', password: adminPass, role: 'Owner' },
      { name: 'Cashier One', username: 'cashier', password: cashierPass, role: 'Cashier' }
    ]);
    
    // Seed Customers
    const Customer = require('./models/Customer');
    await Customer.deleteMany({});
    await Customer.create([
      { name: 'John Doe', phone: '9876543210', email: 'john@example.com', loyaltyPoints: 120, totalSpending: 1200 },
      { name: 'Alice Smith', phone: '9876543211', email: 'alice@example.com', loyaltyPoints: 45, totalSpending: 450 }
    ]);

    console.log('Database seeded successfully!');
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error('Failed to seed database', err);
    mongoose.disconnect();
  });
