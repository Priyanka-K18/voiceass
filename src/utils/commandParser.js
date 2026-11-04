import axios from 'axios';
import Fuse from 'fuse.js';

const API_URL = 'http://localhost:5000/api/products';

const findProduct = (products, searchString) => {
  // Clean up the search string: remove common stop words and typos
  const cleanSearch = searchString.toLowerCase()
    .replace(/\b(product|products|porduct|item|items)\b/gi, '')
    .trim();

  const fuse = new Fuse(products, {
    keys: ['name'],
    threshold: 0.5, // Increased fuzziness to catch typos
    distance: 100
  });
  
  const result = fuse.search(cleanSearch || searchString);
  return result.length > 0 ? result[0].item : null;
};

// Utility to parse text and trigger API calls locally without an API Key
export const processCommand = async (command, products) => {
  const lowerCommand = command.toLowerCase();

  // 1. ADD: "Add 20 Pepsi", "Add 2 milk porduct"
  if (lowerCommand.includes('add')) {
    const match = lowerCommand.match(/add\s+(\d+)\s+(.+)/i);
    if (match) {
      const quantity = parseInt(match[1]);
      let productName = match[2];
      
      const product = findProduct(products, productName);
      if (product) {
        const newQuantity = product.quantity + quantity;
        await axios.put(`${API_URL}/${product._id}`, { quantity: newQuantity });
        return { success: true, message: `Added ${quantity} to ${product.name}. New stock: ${newQuantity}` };
      } else {
        return { success: false, message: `I heard "add ${quantity}", but I couldn't find a product matching "${productName}".` };
      }
    }
  }

  // 2. REMOVE: "Remove 5 rice bags"
  if (lowerCommand.includes('remove') || (lowerCommand.includes('delete') && lowerCommand.match(/\d+/))) {
    const match = lowerCommand.match(/(?:remove|delete)\s+(\d+)\s+(.+)/i);
    if (match) {
      const quantity = parseInt(match[1]);
      let productName = match[2];
      
      const product = findProduct(products, productName);
      if (product) {
        const newQuantity = Math.max(0, product.quantity - quantity);
        await axios.put(`${API_URL}/${product._id}`, { quantity: newQuantity });
        return { success: true, message: `Removed ${quantity} from ${product.name}. New stock: ${newQuantity}` };
      } else {
        return { success: false, message: `I heard "remove ${quantity}", but I couldn't find a product matching "${productName}".` };
      }
    }
  }

  // 3. UPDATE: "Update milk stock to 50"
  if (lowerCommand.includes('update')) {
    const match = lowerCommand.match(/update\s+(.+)\s+to\s+(\d+)/i) || lowerCommand.match(/update\s+(.+)\s+stock\s+to\s+(\d+)/i);
    if (match) {
      let productName = match[1];
      const quantity = parseInt(match[2]);
      
      const product = findProduct(products, productName);
      if (product) {
        await axios.put(`${API_URL}/${product._id}`, { quantity });
        return { success: true, message: `Updated ${product.name} stock to ${quantity}.` };
      } else {
        return { success: false, message: `I heard "update to ${quantity}", but I couldn't find a product matching "${productName}".` };
      }
    }
  }

  // 4. DELETE ENTIRE PRODUCT: "Delete soap"
  if (lowerCommand.includes('delete') && !lowerCommand.match(/\d+/)) {
    const match = lowerCommand.match(/delete\s+(.+)/i);
    if (match) {
      let productName = match[1];
      
      const product = findProduct(products, productName);
      if (product) {
        await axios.delete(`${API_URL}/${product._id}`);
        return { success: true, message: `Deleted product ${product.name}.`, reload: true };
      } else {
        return { success: false, message: `I heard "delete", but I couldn't find a product matching "${productName}".` };
      }
    }
  }

  // 5. SEARCH / FILTER: "Show low stock"
  if (lowerCommand.includes('low stock')) {
    return { success: true, message: `Showing low stock products.`, filter: 'lowStock' };
  }

  return { success: false, message: `Command not recognized: "${command}"` };
};
