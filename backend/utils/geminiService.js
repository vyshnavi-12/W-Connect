const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async compareProductsIntelligently(consumerProducts, providerProductTypes) {
    try {
      const prompt = this.buildProductMatchingPrompt(consumerProducts, providerProductTypes);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse the AI response
      return this.parseAIResponse(text, providerProductTypes.length);
    } catch (error) {
      console.error('Error in Gemini AI product matching:', error);
      throw error;
    }
  }

  buildProductMatchingPrompt(consumerProducts, providerProductTypes) {
    return `
You are an expert product categorization and matching system. Your task is to analyze how well consumer products match with provider storage capabilities.

CONSUMER PRODUCTS: ${consumerProducts.join(', ')}
PROVIDER CAN STORE: ${providerProductTypes.join(', ')}

INSTRUCTIONS:
1. For each provider product type, determine if any consumer products match (including spelling variations, synonyms, related categories)
2. Consider spelling mistakes and variations (e.g., "rase" should match "rice")
3. Consider related categories (e.g., "grains" relates to "rice", "perishables" relates to "fruits")
4. Score each match from 0-100 (0=no match, 100=perfect match)
5. Even if only ONE provider product type matches with consumer products, include it

SCORING CRITERIA:
- Exact match: 100 points
- Very close spelling/synonym: 90-95 points
- Related category: 70-80 points
- Spelling variation: 80-90 points
- Partial match: 60-70 points
- No match: 0 points

RESPONSE FORMAT (JSON only):
{
  "matches": [
    {
      "providerProduct": "provider_product_name",
      "matchedConsumerProducts": ["consumer_product1", "consumer_product2"],
      "score": 85,
      "reason": "explanation of match"
    }
  ],
  "totalScore": 170,
  "hasAnyMatch": true
}

Respond with ONLY the JSON object, no additional text.
`;
  }

  parseAIResponse(text, maxProviderProducts) {
    try {
      // Clean the response text
      const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
      
      // Parse JSON
      const parsed = JSON.parse(cleanText);
      
      // Validate structure
      if (!parsed.matches || !Array.isArray(parsed.matches)) {
        throw new Error('Invalid AI response structure');
      }

      // Calculate total score if not provided
      if (!parsed.totalScore) {
        parsed.totalScore = parsed.matches.reduce((sum, match) => sum + (match.score || 0), 0);
      }

      // Set hasAnyMatch
      parsed.hasAnyMatch = parsed.matches.length > 0 && parsed.totalScore > 0;

      return parsed;
    } catch (error) {
      console.error('Error parsing AI response:', error);
      console.error('Raw response:', text);
      
      // Return null to trigger fallback
      return null;
    }
  }

  async testConnection() {
    try {
      const testPrompt = "Respond with exactly: 'Connection successful'";
      const result = await this.model.generateContent(testPrompt);
      const response = await result.response;
      const text = response.text();
      
      return text.includes('Connection successful');
    } catch (error) {
      console.error('Gemini service test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
const geminiService = new GeminiService();

module.exports = {
  GeminiService: geminiService
};