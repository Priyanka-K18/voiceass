import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Search, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceSearch } from '../context/VoiceSearchContext';
import { handleVoiceCommand } from '../utils/handleVoiceCommand';
import { toast } from 'react-toastify';

const VoiceController = () => {
  const { setSearchQuery, isListening, setIsListening } = useVoiceSearch();
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [browserSupport, setBrowserSupport] = useState(true);
  
  const recognitionRef = useRef(null);
  const isStartedRef = useRef(false);
  const transcriptRef = useRef(''); // To avoid stale closures

  // Keep transcriptRef in sync with transcript state
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  // Handle command processing
  const processCommand = useCallback(async (finalTranscript) => {
    const textToProcess = finalTranscript || transcriptRef.current;
    if (!textToProcess) {
      console.log("ℹ️ No transcript to process.");
      return;
    }

    console.log("⚙️ Processing Command:", textToProcess);
    setIsProcessing(true);
    try {
      await handleVoiceCommand(textToProcess, { 
        setSearchQuery,
        onAddProduct: async (name, qty) => {
          toast.success(`Voice: Adding ${qty} ${name}`);
          try {
            await fetch('http://localhost:5000/api/products/add', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, quantity: qty })
            });
          } catch (e) {
            console.warn("Server unreachable, command simulated.");
          }
        }
      });
    } catch (err) {
      console.error("❌ Process error:", err);
      toast.error("Failed to process command.");
    } finally {
      setIsProcessing(false);
      // Wait a bit before clearing UI transcript
      setTimeout(() => {
        setTranscript('');
        transcriptRef.current = '';
      }, 3000);
    }
  }, [setSearchQuery]);

  // Initialize Speech Recognition once
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setBrowserSupport(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log("🎤 Voice Recognition: Started");
      isStartedRef.current = true;
      setError(null);
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const currentTranscript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      
      setTranscript(currentTranscript);
    };

    recognition.onerror = (event) => {
      console.error('❌ Voice Error:', event.error);
      isStartedRef.current = false;
      setIsListening(false);

      if (event.error === 'no-speech') {
        // Silent fail for no-speech is often better UI
        return;
      }

      let errorMsg = "Something went wrong.";
      switch (event.error) {
        case 'network':
          errorMsg = "Network error. Please check your connection.";
          break;
        case 'not-allowed':
          errorMsg = "Microphone access denied.";
          break;
        case 'audio-capture':
          errorMsg = "Microphone not found.";
          break;
        case 'aborted':
          errorMsg = "Stopped.";
          return; // Don't show toast for intentional abort
        default:
          errorMsg = `Error: ${event.error}`;
      }

      setError(errorMsg);
      toast.error(errorMsg);
    };

    recognition.onend = () => {
      console.log("🎤 Voice Recognition: Ended");
      isStartedRef.current = false;
      setIsListening(false);
      
      // Process what we have so far
      processCommand();
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [setIsListening, processCommand]);

  const toggleListening = () => {
    if (!browserSupport) {
      toast.error("Speech Recognition not supported.");
      return;
    }

    if (!recognitionRef.current) return;

    if (isStartedRef.current) {
      recognitionRef.current.stop();
    } else {
      try {
        setTranscript('');
        transcriptRef.current = '';
        setError(null);
        recognitionRef.current.start();
      } catch (err) {
        console.error("Start error:", err);
        if (err.name === 'InvalidStateError') {
          // Already running, just sync state
          setIsListening(true);
          isStartedRef.current = true;
        }
      }
    }
  };

  if (!browserSupport) return null;

  return (
    <div className="flex flex-col items-center gap-4 relative">
      {/* Error / Status Bubble */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -top-16 glass-dark border border-red-500/30 px-4 py-2 rounded-2xl flex items-center gap-3 text-red-200 text-xs shadow-2xl"
          >
            <AlertTriangle size={14} className="text-red-400" />
            <span>{error}</span>
            <button onClick={toggleListening} className="p-1 hover:bg-white/10 rounded-full">
              <Activity size={12} className="text-blue-400" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex items-center justify-center">
        <AnimatePresence>
          {isListening && (
            <>
              {/* Animated Rings */}
              {[1, 2].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0.5, scale: 1 }}
                  animate={{ opacity: 0, scale: 3 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.7, ease: "easeOut" }}
                  className="absolute w-16 h-16 rounded-full border border-blue-500/40"
                />
              ))}
              
              {/* Waveform Visualization */}
              <div className="absolute -bottom-10 flex gap-1.5 items-end h-10 px-4">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [4, Math.random() * 24 + 8, 4] }}
                    transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.05 }}
                    className="w-1 bg-gradient-to-t from-blue-600 via-cyan-400 to-transparent rounded-full shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                  />
                ))}
              </div>
            </>
          )}
        </AnimatePresence>

        {/* Main Mic Button */}
        <motion.button
          onClick={toggleListening}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-700 shadow-[0_0_50px_rgba(0,0,0,0.3)] ${
            isListening 
              ? 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 ring-4 ring-blue-500/20' 
              : error 
                ? 'bg-gray-900 border border-red-500/50' 
                : 'bg-gray-800 hover:bg-gray-700 border border-white/5'
          }`}
        >
          {isProcessing ? (
            <Activity className="w-10 h-10 text-blue-400 animate-spin" />
          ) : isListening ? (
            <div className="relative">
              <Mic className="w-10 h-10 text-white" />
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"
              />
            </div>
          ) : error ? (
            <Activity className="w-8 h-8 text-red-400" />
          ) : (
            <MicOff className="w-10 h-10 text-gray-500" />
          )}
        </motion.button>
      </div>

      {/* Real-time Feedback UI */}
      <AnimatePresence>
        {(transcript || isListening || isProcessing) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-dark p-5 rounded-3xl border border-white/10 shadow-2xl w-72 text-center overflow-hidden"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              {isProcessing ? (
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <motion.div 
                      key={i}
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                      className="w-1.5 h-1.5 bg-blue-400 rounded-full"
                    />
                  ))}
                </div>
              ) : isListening ? (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded-full">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-[10px] text-red-400 font-black uppercase tracking-widest">Live</span>
                </div>
              ) : (
                <CheckCircle size={14} className="text-emerald-400" />
              )}
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
                {isProcessing ? "Analyzing..." : isListening ? "Listening..." : "Done"}
              </span>
            </div>
            
            <div className="relative">
              <p className={`text-sm leading-relaxed transition-all duration-500 ${
                isListening ? 'text-white font-medium italic' : 'text-gray-400'
              }`}>
                {transcript || (isListening ? "Waiting for speech..." : "")}
              </p>
              {!transcript && isListening && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 text-[10px] text-gray-500"
                >
                  "Show milk", "Add 5 laptops", etc.
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceController;