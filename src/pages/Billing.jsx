import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, User, QrCode, Download, Plus, Minus, Trash2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useTheme } from '../context/ThemeContext';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Billing = () => {
  const { isDark } = useTheme();
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  
  const [showQR, setShowQR] = useState(false);
  const [billGenerated, setBillGenerated] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/products');
      setProducts(data);
    } catch (err) {
      toast.error('Failed to load products');
    }
  };

  const fetchCustomers = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/customers');
      setCustomers(data);
    } catch (err) {
      toast.error('Failed to load customers');
    }
  };

  const addToCart = (product) => {
    if (product.quantity <= 0) {
      toast.error('Out of stock!');
      return;
    }
    
    setCart(prev => {
      const existing = prev.find(item => item.productId === product._id);
      if (existing) {
        if (existing.cartQuantity >= product.quantity) {
          toast.warning('Max stock reached!');
          return prev;
        }
        return prev.map(item => 
          item.productId === product._id 
            ? { ...item, cartQuantity: item.cartQuantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, productId: product._id, cartQuantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.productId === id) {
        const newQ = item.cartQuantity + delta;
        if (newQ > 0 && newQ <= item.quantity) {
          return { ...item, cartQuantity: newQ };
        }
      }
      return item;
    }));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.productId !== id));
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);
    const gst = subtotal * 0.18;
    const total = subtotal + gst;
    return { subtotal, gst, total };
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.warning('Cart is empty!');
      return;
    }

    const customer = customers.find(c => c._id === selectedCustomer);
    
    const payload = {
      customerId: selectedCustomer || null,
      customerName: customer ? customer.name : 'Walk-in Customer',
      customerPhone: customer ? customer.phone : customerPhone,
      items: cart.map(item => ({
        productId: item.productId,
        productName: item.name,
        quantity: item.cartQuantity,
        price: item.price,
        total: item.price * item.cartQuantity
      })),
      paymentMethod
    };

    try {
      const { data } = await axios.post('http://localhost:5000/api/bills', payload);
      toast.success('Bill generated successfully!');
      setBillGenerated(data);
      if (paymentMethod === 'UPI') {
        setShowQR(true);
      }
      setCart([]);
      fetchProducts(); // Refresh stock
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to checkout');
    }
  };

  const downloadPDF = () => {
    if (!billGenerated) return;

    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Smart Inventory Invoice', 14, 22);
    
    doc.setFontSize(10);
    doc.text(`Bill No: ${billGenerated.billNumber}`, 14, 32);
    doc.text(`Date: ${new Date(billGenerated.createdAt).toLocaleString()}`, 14, 38);
    doc.text(`Customer: ${billGenerated.customerName}`, 14, 44);

    const tableColumn = ["Item", "Qty", "Price", "Total"];
    const tableRows = [];

    billGenerated.items.forEach(item => {
      const itemData = [
        item.productName,
        item.quantity,
        `$${item.price.toFixed(2)}`,
        `$${item.total.toFixed(2)}`
      ];
      tableRows.push(itemData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 50,
      theme: 'grid',
    });

    const finalY = doc.lastAutoTable.finalY || 50;
    doc.text(`Subtotal: $${billGenerated.subtotal.toFixed(2)}`, 14, finalY + 10);
    doc.text(`GST (18%): $${billGenerated.gstAmount.toFixed(2)}`, 14, finalY + 16);
    doc.setFontSize(14);
    doc.text(`Total Amount: $${billGenerated.totalAmount.toFixed(2)}`, 14, finalY + 26);

    doc.save(`${billGenerated.billNumber}.pdf`);
  };

  const { subtotal, gst, total } = calculateTotals();

  return (
    <div className="flex gap-6 h-full">
      {/* Products Selection */}
      <div className={`flex-1 flex flex-col p-6 rounded-2xl ${isDark ? 'glass-dark' : 'bg-white shadow-xl'}`}>
        <h2 className="text-2xl font-bold mb-4">Products</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pr-2 pb-4">
          {products.map(product => (
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => addToCart(product)}
              key={product._id} 
              className={`p-4 rounded-xl cursor-pointer border ${
                product.quantity === 0 ? 'opacity-50 grayscale border-red-500/50' : 
                isDark ? 'bg-white/5 border-white/10 hover:border-blue-500' : 'bg-gray-50 border-gray-200 hover:border-blue-500'
              }`}
            >
              <img src={product.productImage || 'https://via.placeholder.com/100'} alt={product.name} className="w-full h-24 object-cover rounded-lg mb-3" />
              <h3 className="font-bold truncate">{product.name}</h3>
              <div className="flex justify-between items-center mt-2">
                <span className="text-emerald-500 font-bold">${product.price}</span>
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Stock: {product.quantity}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Cart & Billing */}
      <div className={`w-96 flex flex-col p-6 rounded-2xl ${isDark ? 'glass-dark' : 'bg-white shadow-xl'}`}>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><ShoppingCart /> Current Bill</h2>
        
        {/* Customer Select */}
        <div className="mb-4 space-y-3">
          <div className={`flex items-center px-3 py-2 rounded-xl border ${isDark ? 'bg-black/50 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
            <User size={18} className={isDark ? 'text-gray-400' : 'text-gray-400'} />
            <select 
              value={selectedCustomer} 
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className={`w-full bg-transparent border-none outline-none ml-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
            >
              <option value="">Walk-in Customer</option>
              {customers.map(c => (
                <option key={c._id} value={c._id} className={isDark ? 'bg-gray-800' : ''}>{c.name} - {c.phone}</option>
              ))}
            </select>
          </div>
          {!selectedCustomer && (
            <input 
              type="text" 
              placeholder="Phone Number (Optional)" 
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className={`w-full px-4 py-2 rounded-xl border ${isDark ? 'bg-black/50 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
            />
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-3">
          {cart.length === 0 ? (
            <div className={`h-full flex items-center justify-center text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Cart is empty</div>
          ) : (
            cart.map(item => (
              <div key={item.productId} className={`p-3 rounded-xl border flex justify-between items-center ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                  <span className="text-emerald-500 font-bold text-sm">${item.price * item.cartQuantity}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.productId, -1)} className="p-1 rounded-full bg-red-500/20 text-red-500"><Minus size={14}/></button>
                  <span className="w-4 text-center text-sm">{item.cartQuantity}</span>
                  <button onClick={() => updateQuantity(item.productId, 1)} className="p-1 rounded-full bg-emerald-500/20 text-emerald-500"><Plus size={14}/></button>
                  <button onClick={() => removeFromCart(item.productId)} className="ml-2 text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals & Checkout */}
        <div className="pt-4 border-t border-inherit space-y-2">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>GST (18%)</span>
            <span>${gst.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-black mt-2">
            <span>Total</span>
            <span className="text-emerald-500">${total.toFixed(2)}</span>
          </div>

          <select 
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className={`w-full mt-4 p-3 rounded-xl border ${isDark ? 'bg-black/50 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
          >
            <option value="UPI">UPI / QR Code</option>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
          </select>

          <button 
            onClick={handleCheckout}
            className="w-full mt-2 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-500 text-white font-bold text-lg flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-500/25 transition-all active:scale-95"
          >
            Generate Bill
          </button>
        </div>
      </div>

      {/* QR/PDF Modal overlay */}
      {billGenerated && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`w-full max-w-md p-8 rounded-3xl text-center ${isDark ? 'glass-dark border border-white/10' : 'bg-white shadow-2xl'}`}
          >
            <h2 className="text-3xl font-black text-emerald-500 mb-2">Success!</h2>
            <p className="mb-6">Bill {billGenerated.billNumber} created.</p>
            
            {showQR && (
              <div className="mb-6 flex justify-center p-4 bg-white rounded-2xl mx-auto w-fit">
                <QRCodeSVG value={`upi://pay?pa=mock@upi&pn=SmartInventory&am=${billGenerated.totalAmount}`} size={200} />
              </div>
            )}
            <p className="text-2xl font-bold mb-6">${billGenerated.totalAmount.toFixed(2)}</p>

            <div className="flex gap-4">
              <button 
                onClick={downloadPDF}
                className="flex-1 py-3 rounded-xl bg-blue-500 text-white font-bold flex items-center justify-center gap-2"
              >
                <Download size={20} /> Print PDF
              </button>
              <button 
                onClick={() => { setBillGenerated(null); setShowQR(false); }}
                className={`flex-1 py-3 rounded-xl font-bold ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Billing;
