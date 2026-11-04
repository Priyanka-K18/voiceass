import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  Receipt, 
  Users, 
  Settings, 
  LogOut,
  Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { isDark } = useTheme();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['Owner', 'Manager'] },
    { name: 'Inventory', path: '/inventory', icon: Package, roles: ['Owner', 'Manager', 'Cashier'] },
    { name: 'Billing', path: '/billing', icon: Receipt, roles: ['Owner', 'Manager', 'Cashier'] },
    { name: 'Customers', path: '/customers', icon: Users, roles: ['Owner', 'Manager'] },
    { name: 'Settings', path: '/settings', icon: Settings, roles: ['Owner'] },
  ];

  return (
    <motion.aside 
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className={`w-64 h-full flex flex-col border-r ${isDark ? 'glass-dark border-white/10' : 'bg-white border-gray-200 shadow-xl z-20'}`}
    >
      <div className="p-6 flex items-center gap-3 border-b border-inherit">
        <Activity className="text-blue-500" size={32} />
        <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
          Smart AI
        </h1>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          if (item.roles && !item.roles.includes(user?.role)) return null;
          
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium
                ${isActive 
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
                  : `${isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`
                }
              `}
            >
              <item.icon size={20} />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-inherit">
        <div className={`p-4 rounded-xl mb-4 ${isDark ? 'bg-black/40' : 'bg-gray-50 border border-gray-200'}`}>
          <p className="text-sm font-bold truncate">{user?.name}</p>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{user?.role}</p>
        </div>
        <button 
          onClick={logout}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors
            ${isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-500 hover:bg-red-50'}
          `}
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
