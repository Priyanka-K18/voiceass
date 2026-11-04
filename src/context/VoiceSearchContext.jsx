import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const VoiceSearchContext = createContext();

export const useVoiceSearch = () => {
  const context = useContext(VoiceSearchContext);
  if (!context) {
    throw new Error('useVoiceSearch must be used within a VoiceSearchProvider');
  }
  return context;
};

export const VoiceSearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const value = useMemo(() => ({
    searchQuery,
    setSearchQuery,
    isListening,
    setIsListening,
    clearSearch
  }), [searchQuery, isListening, clearSearch]);

  return (
    <VoiceSearchContext.Provider value={value}>
      {children}
    </VoiceSearchContext.Provider>
  );
};
