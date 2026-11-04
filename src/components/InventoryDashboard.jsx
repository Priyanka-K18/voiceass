import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, AlertTriangle, CheckCircle } from 'lucide-react';

const InventoryDashboard = ({ products }) => {
  if (products.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center p-12 glass-dark rounded-3xl border border-white/10 text-center"
      >
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle size={48} className="text-red-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">No Products Found</h3>
        <p className="text-gray-400 max-w-md">
          We couldn't find any products matching your voice command. Try saying the product name more clearly or search for a different category.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-8 px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white font-medium transition-colors"
          onClick={() => window.location.reload()}
        >
          View All Products
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {products.map((product) => (
            <motion.div
              key={product._id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="glass p-4 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative mb-4">
                <img 
                  src={product.productImage || 'https://via.placeholder.com/150'} 
                  alt={product.name} 
                  className="w-24 h-24 object-cover rounded-full shadow-lg border-4 border-white/5 group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/20 to-transparent pointer-events-none" />
              </div>

              <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">{product.name}</h3>
              <p className="text-sm text-gray-400 mb-4">{product.category}</p>
              
              <div className="w-full flex justify-between items-center bg-black/30 rounded-2xl p-4 backdrop-blur-md border border-white/5">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Stock</span>
                  <span className="text-2xl font-black text-white">{product.quantity}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Price</span>
                  <span className="text-xl font-bold text-emerald-400">${product.price}</span>
                </div>
              </div>
              
              <div className={`mt-4 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-1.5 ${
                product.stockStatus === 'Out of Stock' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                product.stockStatus === 'Low Stock' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {product.stockStatus === 'Out of Stock' ? <AlertTriangle size={12} /> :
                 product.stockStatus === 'Low Stock' ? <AlertTriangle size={12} /> :
                 <CheckCircle size={12} />}
                {product.stockStatus}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <motion.div 
        layout
        className="glass-dark rounded-3xl p-8 mt-12 border border-white/10 shadow-2xl overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
        
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Package className="text-blue-400" size={24} />
          </div>
          Detailed Inventory
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-gray-400 text-xs uppercase tracking-widest">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium text-center">Stock</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {products.map((product) => (
                  <motion.tr 
                    key={product._id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="group bg-white/5 hover:bg-white/10 transition-all rounded-2xl"
                  >
                    <td className="px-4 py-4 rounded-l-2xl">
                      <div className="flex items-center gap-3">
                        <img src={product.productImage} className="w-10 h-10 rounded-full border border-white/10" alt="" />
                        <div>
                          <p className="font-bold text-white group-hover:text-blue-400 transition-colors">{product.name}</p>
                          <p className="text-[10px] text-gray-500">ID: {product.productId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-300 text-sm">{product.category}</td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-lg font-black text-white">{product.quantity}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-bold text-emerald-400">${product.price}</span>
                    </td>
                    <td className="px-4 py-4 rounded-r-2xl">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                        product.stockStatus === 'Out of Stock' ? 'text-red-400 bg-red-400/10' :
                        product.stockStatus === 'Low Stock' ? 'text-yellow-400 bg-yellow-400/10' :
                        'text-emerald-400 bg-emerald-400/10'
                      }`}>
                        {product.stockStatus}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default InventoryDashboard;
