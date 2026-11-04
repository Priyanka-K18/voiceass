const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');

const parseCommand = async (req, res) => {
  try {
    const { command, products } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return res.status(400).json({ error: 'GEMINI_API_KEY is not configured in the server/.env file' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Extract product names to give the AI context of what products exist
    const productList = products.map(p => p.name).join(', ');

    const systemInstruction = `
Your job is to understand user voice input and convert it into structured inventory and management actions.
You must detect the intent and extract relevant details.

Available intents:
- ADD: When user wants to add stock
- REMOVE: When user wants to reduce/remove stock
- UPDATE: When user wants to set stock to a specific number
- DELETE: When user wants to delete a product entirely
- SEARCH: When user wants to search or filter products (e.g. low stock)
- GENERATE_BILL: When user wants to create a bill/invoice for a customer
- SHOW_SALES: When user wants to see sales, revenue, or analytics
- CUSTOMER_INFO: When user wants to find information about a customer
- NAVIGATE: When user wants to go to a specific page (dashboard, billing, inventory, customers)
- UNKNOWN: When the command is not understood

Available products in inventory: ${productList || 'None'}

Return ONLY a valid JSON object matching this schema. Do not return markdown formatted text or any other explanation:
{
  "intent": "ADD | REMOVE | UPDATE | DELETE | SEARCH | GENERATE_BILL | SHOW_SALES | CUSTOMER_INFO | NAVIGATE | UNKNOWN",
  "productName": "string (the closest matching product name from the available inventory, or null if not applicable)",
  "quantity": "number (the quantity mentioned, or null)",
  "filter": "string (if intent is SEARCH, e.g., 'lowStock')",
  "customerName": "string (if intent is GENERATE_BILL or CUSTOMER_INFO, extract customer name)",
  "page": "string (if intent is NAVIGATE, extract destination like 'billing', 'dashboard')"
}
`;

    const result = await model.generateContent([
      systemInstruction,
      `User command: "${command}"`
    ]);

    const responseText = result.response.text().trim();
    
    // Parse the JSON. The model might sometimes wrap it in ```json ... ``` despite instructions.
    let jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
    let parsedResponse;
    if (jsonMatch && jsonMatch[1]) {
      parsedResponse = JSON.parse(jsonMatch[1]);
    } else {
      // Remove any markdown block syntax if it exists but regex didn't match perfectly
      let cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedResponse = JSON.parse(cleanText);
    }

    res.json(parsedResponse);
  } catch (error) {
    console.error('Error parsing command with AI:', error);
    res.status(500).json({ error: 'Failed to parse command using AI' });
  }
};

module.exports = {
  parseCommand
};
