import React from 'react';
import { Sun, Moon, Bell } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import VoiceController from '../VoiceController';
import { toast } from 'react-toastify';
import axios from 'axios';
import { processCommand } from '../../utils/commandParser';
import { useNavigate } from 'react-router-dom';

const Topbar = () => {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const speakMessage = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleVoiceCommand = async (command) => {
    try {
      // Fetch latest products for context if needed by legacy parser, 
      // but we will mainly rely on server parsing now.
      const productsRes = await axios.get('http://localhost:5000/api/products');
      
      const response = await axios.post('http://localhost:5000/api/parse-command', {
        command,
        products: productsRes.data
      });

      const data = response.data;

      if (data.intent === 'NAVIGATE') {
        speakMessage(`Navigating to ${data.page}`);
        navigate(`/${data.page.toLowerCase()}`);
        toast.info(`Moved to ${data.page}`);
        return;
      }
      
      // For ADD/REMOVE/UPDATE we pass to the client-side parser 
      // (in a real app we'd move all logic to server, but we reuse existing logic here)
      const result = await processCommand(command, productsRes.data);
      speakMessage(result.message);

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to process command");
    }
  };

  return (
    <header className={`h-20 flex items-center justify-between px-8 border-b z-10 backdrop-blur-md
      ${isDark ? 'glass-dark border-white/10' : 'bg-white/80 border-gray-200'}
    `}>
      <div>
        <h2 className="text-xl font-bold">Good Morning!</h2>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Here's what's happening today.</p>
      </div>

      <div className="flex items-center gap-6">
        <VoiceController onCommand={handleVoiceCommand} />

        <button className={`p-2 rounded-full transition-colors relative
          ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}
        `}>
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <button 
          onClick={toggleTheme}
          className={`p-2 rounded-full transition-colors
            ${isDark ? 'hover:bg-white/10 text-yellow-400' : 'hover:bg-gray-100 text-gray-600'}
          `}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
};

export default Topbar;
