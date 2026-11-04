/**
 * Intelligent Voice Command Parser
 * Extracts intent and entities from spoken text.
 */
export const handleVoiceCommand = async (text, { setSearchQuery, onAddProduct }) => {
  const lowerText = text.toLowerCase().trim();
  
  // Filler words to remove for product extraction
  const fillerWords = [
    "show", "display", "search", "open", "find", "give me", 
    "list", "tell me about", "look for", "products", "items"
  ];

  // 1. Check for SEARCH intent
  const searchTriggers = ["show", "search", "find", "display", "open", "list", "look for"];
  const isSearch = searchTriggers.some(trigger => lowerText.startsWith(trigger)) || 
                   (!lowerText.includes("add") && !lowerText.includes("plus"));

  if (isSearch) {
    let productName = lowerText;
    
    // Remove search triggers
    searchTriggers.forEach(trigger => {
      if (productName.startsWith(trigger)) {
        productName = productName.replace(trigger, "").trim();
      }
    });

    // Remove other filler words
    fillerWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'g');
      productName = productName.replace(regex, "").trim();
    });

    // Remove plural 's' if it looks like a common search (e.g., "laptops" -> "laptop")
    if (productName.endsWith('s') && productName.length > 3) {
      // Very basic singularization, could be improved with a library
      // but for "milk", "laptop", "rice" it works okay if we don't overdo it.
      // Let's keep it simple for now as requested.
    }

    console.log("Extracted Product for Search:", productName);
    if (setSearchQuery) {
      setSearchQuery(productName);
    }
    return { type: 'SEARCH', product: productName };
  }

  // 2. Check for ADD intent
  if (lowerText.includes("add") || lowerText.includes("plus")) {
    const quantityMatch = lowerText.match(/\d+/);
    const quantity = quantityMatch ? parseInt(quantityMatch[0]) : 1;

    let productName = lowerText
      .replace("add", "")
      .replace("plus", "")
      .replace(/\d+/g, "")
      .trim();

    console.log("Extracted Product for Add:", productName, "Quantity:", quantity);
    
    if (onAddProduct) {
      await onAddProduct(productName, quantity);
    }

    return { type: 'ADD', product: productName, quantity };
  }

  return { type: 'UNKNOWN', text: lowerText };
};