import React, { useState, useEffect, useMemo } from 'react';
import InventoryDashboard from '../components/InventoryDashboard';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useVoiceSearch } from '../context/VoiceSearchContext';
import { Search, X } from 'lucide-react';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { searchQuery, setSearchQuery, clearSearch } = useVoiceSearch();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/products');
        setProducts(data);
      } catch (err) {
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    
    const query = searchQuery.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.category.toLowerCase().includes(query) ||
      p.productId.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            Inventory Overview
          </h1>
          <p className="text-sm text-gray-400 mt-1">Manage and track your products in real-time.</p>
        </div>

        {searchQuery && (
          <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-xl animate-in fade-in slide-in-from-right-4">
            <Search size={16} className="text-blue-400" />
            <span className="text-sm font-medium text-blue-100">Filtering: "{searchQuery}"</span>
            <button 
              onClick={clearSearch}
              className="ml-2 p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={14} className="text-gray-400" />
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <InventoryDashboard products={filteredProducts} />
      )}
    </div>
  );
};

export default Inventory;
