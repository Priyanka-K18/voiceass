import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, AreaChart, Area
} from 'recharts';
import { Activity, TrendingUp, DollarSign, Package, AlertTriangle, Sparkles } from 'lucide-react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

const Dashboard = () => {
  const { isDark } = useTheme();
  const [stats, setStats] = useState({
    totalSales: 0,
    revenue: 0,
    orders: 0,
    lowStock: 0
  });

  const [salesData, setSalesData] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);

  useEffect(() => {
    // Mocking real API calls for dashboard data
    // In production, these would fetch from /api/analytics
    setStats({
      totalSales: 1240,
      revenue: 45230.50,
      orders: 342,
      lowStock: 5
    });

    const mockSalesData = [
      { name: 'Mon', sales: 4000, profit: 2400 },
      { name: 'Tue', sales: 3000, profit: 1398 },
      { name: 'Wed', sales: 2000, profit: 9800 },
      { name: 'Thu', sales: 2780, profit: 3908 },
      { name: 'Fri', sales: 1890, profit: 4800 },
      { name: 'Sat', sales: 2390, profit: 3800 },
      { name: 'Sun', sales: 3490, profit: 4300 },
    ];
    setSalesData(mockSalesData);

    setAiInsights([
      { type: 'warning', text: 'Demand for "Laptop" is projected to spike 25% next week due to back-to-school season. Restock soon.' },
      { type: 'success', text: 'Profit margins increased by 4% on Groceries this month.' },
      { type: 'info', text: 'War impact analysis: Global shipping delays may increase Electronics pricing by 10%.' }
    ]);
  }, []);

  const statCards = [
    { title: 'Total Revenue', value: `$${stats.revenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { title: 'Total Orders', value: stats.orders, icon: Activity, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Items Sold', value: stats.totalSales, icon: Package, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { title: 'Low Stock Alerts', value: stats.lowStock, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            Owner Dashboard
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Real-time business analytics and AI predictions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`p-6 rounded-2xl border flex items-center gap-4 ${isDark ? 'glass-dark border-white/10' : 'bg-white shadow-lg border-gray-200'}`}
          >
            <div className={`p-4 rounded-xl ${stat.bg}`}>
              <stat.icon className={stat.color} size={24} />
            </div>
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{stat.title}</p>
              <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`lg:col-span-2 p-6 rounded-2xl border ${isDark ? 'glass-dark border-white/10' : 'bg-white shadow-lg border-gray-200'}`}
        >
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><TrendingUp className="text-blue-500"/> Sales & Revenue Trend</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke={isDark ? '#6b7280' : '#9ca3af'} />
                <YAxis stroke={isDark ? '#6b7280' : '#9ca3af'} />
                <Tooltip 
                  contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: isDark ? '#e5e7eb' : '#1f2937' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="profit" stroke="#10b981" fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className={`p-6 rounded-2xl border flex flex-col ${isDark ? 'bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-indigo-500/30' : 'bg-indigo-50 shadow-lg border-indigo-100'}`}
        >
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Sparkles className="text-yellow-400"/> AI Recommendations
          </h3>
          <div className="flex-1 space-y-4">
            {aiInsights.map((insight, idx) => (
              <div key={idx} className={`p-4 rounded-xl text-sm leading-relaxed border ${
                insight.type === 'warning' ? (isDark ? 'bg-red-500/10 border-red-500/20 text-red-200' : 'bg-red-100 border-red-200 text-red-800') :
                insight.type === 'success' ? (isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200' : 'bg-emerald-100 border-emerald-200 text-emerald-800') :
                (isDark ? 'bg-blue-500/10 border-blue-500/20 text-blue-200' : 'bg-blue-100 border-blue-200 text-blue-800')
              }`}>
                {insight.text}
              </div>
            ))}
          </div>
          <button className={`mt-4 w-full py-3 rounded-xl font-bold text-sm transition-all ${isDark ? 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}>
            Generate Detailed Report
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
