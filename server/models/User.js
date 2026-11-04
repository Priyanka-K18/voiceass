const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Owner', 'Manager', 'Cashier'], default: 'Cashier' },
  name: { type: String, required: true },
  attendance: [
    {
      date: { type: Date, default: Date.now },
      status: { type: String, enum: ['Present', 'Absent', 'Leave'], default: 'Present' }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
