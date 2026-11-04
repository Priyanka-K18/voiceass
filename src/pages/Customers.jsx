import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Award, DollarSign } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useTheme } from '../context/ThemeContext';

const Customers = () => {
  const { isDark } = useTheme();
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`http://localhost:5000/api/customers?search=${search}`);
      setCustomers(data);
    } catch (err) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 flex items-center gap-3">
            <Users className="text-blue-400" size={32} />
            Customer Management
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Track loyalty points and purchase history.</p>
        </div>

        <div className={`flex items-center px-4 py-2 rounded-xl w-full md:w-auto border ${isDark ? 'glass-dark border-white/10 focus-within:border-blue-500' : 'bg-white border-gray-200 focus-within:border-blue-500'}`}>
          <Search size={20} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Search name or phone..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`bg-transparent border-none outline-none ml-3 w-64 ${isDark ? 'text-white' : 'text-gray-900'}`}
          />
        </div>
      </div>

      {loading ? (
         <div className="flex justify-center items-center h-64">
           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {customers.map((customer, idx) => (
              <motion.div
                key={customer._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
                className={`p-6 rounded-2xl border relative overflow-hidden group ${
                  idx < 3 ? 'bg-gradient-to-br from-blue-500/10 to-emerald-500/10' : ''
                } ${isDark ? 'glass-dark border-white/10 hover:border-blue-500/50' : 'bg-white shadow-xl border-gray-200'}`}
              >
                {idx === 0 && <div className="absolute top-4 right-4 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-yellow-500/20"><Award size={12}/> Top Buyer</div>}
                
                <h3 className="text-xl font-bold mb-1">{customer.name}</h3>
                <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{customer.phone} {customer.email && `• ${customer.email}`}</p>
                
                <div className="flex gap-4">
                  <div className={`flex-1 p-3 rounded-xl flex flex-col items-center justify-center ${isDark ? 'bg-black/40' : 'bg-gray-50'}`}>
                    <DollarSign className="text-emerald-500 mb-1" size={20} />
                    <span className="text-lg font-black">${customer.totalSpending.toFixed(2)}</span>
                    <span className="text-xs text-gray-400">Total Spent</span>
                  </div>
                  <div className={`flex-1 p-3 rounded-xl flex flex-col items-center justify-center ${isDark ? 'bg-black/40' : 'bg-gray-50'}`}>
                    <Award className="text-blue-500 mb-1" size={20} />
                    <span className="text-lg font-black">{customer.loyaltyPoints}</span>
                    <span className="text-xs text-gray-400">Points</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Customers;
