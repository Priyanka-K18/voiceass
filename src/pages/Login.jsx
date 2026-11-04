import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Lock, User, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isDark } = useTheme();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/login', {
        username,
        password
      });

      login(data);
      toast.success(`Welcome back, ${data.name}!`);
      
      // Route based on role
      if (data.role === 'Owner' || data.role === 'Manager') {
        navigate('/dashboard');
      } else {
        navigate('/billing');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Pre-fill mock data for prototype demo
  const fillMock = (role) => {
    if (role === 'owner') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername('cashier');
      setPassword('cashier123');
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
      
      {/* Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-md p-8 rounded-3xl relative z-10 shadow-2xl backdrop-blur-xl border
          ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}
        `}
      >
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30"
          >
            <Activity className="text-white" size={40} />
          </motion.div>
          <h1 className={`text-3xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>Smart Inventory</h1>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Secure Access Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <div className={`flex items-center px-4 py-3 rounded-xl border ${isDark ? 'bg-black/50 border-white/10 focus-within:border-blue-500' : 'bg-gray-50 border-gray-200 focus-within:border-blue-500'} transition-colors`}>
              <User size={20} className={isDark ? 'text-gray-400' : 'text-gray-400'} />
              <input 
                type="text" 
                placeholder="Username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full bg-transparent border-none outline-none ml-3 ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
                required
              />
            </div>
          </div>

          <div>
            <div className={`flex items-center px-4 py-3 rounded-xl border ${isDark ? 'bg-black/50 border-white/10 focus-within:border-blue-500' : 'bg-gray-50 border-gray-200 focus-within:border-blue-500'} transition-colors`}>
              <Lock size={20} className={isDark ? 'text-gray-400' : 'text-gray-400'} />
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full bg-transparent border-none outline-none ml-3 ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-500 text-white font-bold text-lg flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-500/25 transition-all active:scale-95 disabled:opacity-70"
          >
            {isLoading ? 'Authenticating...' : (
              <>Login <ArrowRight size={20} /></>
            )}
          </button>
        </form>

        <div className="mt-8 flex justify-center gap-4">
          <button onClick={() => fillMock('owner')} className={`text-xs px-3 py-1 rounded-full border ${isDark ? 'border-white/10 text-gray-400 hover:text-white hover:bg-white/5' : 'border-gray-200 text-gray-600 hover:bg-gray-100'}`}>Demo Owner</button>
          <button onClick={() => fillMock('cashier')} className={`text-xs px-3 py-1 rounded-full border ${isDark ? 'border-white/10 text-gray-400 hover:text-white hover:bg-white/5' : 'border-gray-200 text-gray-600 hover:bg-gray-100'}`}>Demo Cashier</button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
