import React from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Save } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';

const Settings = () => {
  const { isDark } = useTheme();

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 flex items-center gap-3">
        <SettingsIcon className="text-blue-400" size={32} />
        System Settings
      </h1>
      
      <div className={`p-6 rounded-2xl border ${isDark ? 'glass-dark border-white/10' : 'bg-white shadow-xl border-gray-200'}`}>
        <h2 className="text-xl font-bold mb-4">Store Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Store Name</label>
            <input type="text" defaultValue="Smart Inventory Main" className={`w-full p-3 rounded-xl border ${isDark ? 'bg-black/50 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`} />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Tax Number (GST)</label>
            <input type="text" defaultValue="27AADCB2230M1Z2" className={`w-full p-3 rounded-xl border ${isDark ? 'bg-black/50 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`} />
          </div>
        </div>
      </div>

      <div className={`p-6 rounded-2xl border ${isDark ? 'glass-dark border-white/10' : 'bg-white shadow-xl border-gray-200'}`}>
        <h2 className="text-xl font-bold mb-4">Voice Assistant</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Speech Recognition Language</p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Choose the primary language for voice commands.</p>
            </div>
            <select className={`p-2 rounded-xl border ${isDark ? 'bg-black/50 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}>
              <option value="en-US">English (US)</option>
              <option value="hi-IN">Hindi (India)</option>
              <option value="ta-IN">Tamil (India)</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
             <div>
              <p className="font-semibold">Voice Feedback</p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Enable AI text-to-speech responses.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={handleSave}
          className="px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all"
        >
          <Save size={20} /> Save Changes
        </button>
      </div>

    </div>
  );
};

export default Settings;
