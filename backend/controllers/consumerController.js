const { Consumer } = require('../models/Consumer');
const { GeminiService } = require('../utils/geminiService');

// Get consumers connected to a specific provider who need storage
const getConsumersForProvider = async (req, res) => {
  try {
    const { providerId } = req.params;
    const { productTypes } = req.body;
    
    if (!providerId) {
      return res.status(400).json({
        success: false,
        message: 'Provider ID is required'
      });
    }

    // Find consumers connected to this provider who need storage
    const allConsumers = await Consumer.find({
      connectedProvider: providerId,
      needsStorage: true,
      status: 'accepted'
    })
    .select('shopName location email productDetails needsStorage')
    .sort({ acceptedAt: -1 }); // Sort by most recently accepted

    if (allConsumers.length === 0) {
      return res.status(200).json({
        success: true,
        consumers: [],
        count: 0,
        message: 'No consumers found who need storage'
      });
    }

    // If no product types specified or AI fails, return all consumers who need storage
    if (!productTypes || !productTypes.trim()) {
      return res.status(200).json({
        success: true,
        consumers: allConsumers,
        count: allConsumers.length,
        message: 'Returning all consumers who need storage (no product matching performed)'
      });
    }

    // Parse product types from provider input
    const providerProductTypes = productTypes.toLowerCase().split(',').map(type => type.trim());
    
    try {
      // Enhanced matching with AI and scoring
      const matchingConsumersWithScores = [];

      for (const consumer of allConsumers) {
        if (!consumer.productDetails || consumer.productDetails.length === 0) {
          continue;
        }

        // Calculate matching score for this consumer
        const aiMatchingResult = await GeminiService.compareProductsIntelligently(
          consumer.productDetails,
          providerProductTypes
        );

        if (aiMatchingResult && aiMatchingResult.hasAnyMatch) {
          matchingConsumersWithScores.push({
            ...consumer.toObject(),
            matchingScore: aiMatchingResult.totalScore,
            aiEnhanced: true
          });
        }
      }

      // Sort by matching score in descending order and limit to top 10
      const topMatchingConsumers = matchingConsumersWithScores
        .sort((a, b) => b.matchingScore - a.matchingScore)
        .slice(0, 10)
        .map(consumer => {
          // Remove temporary fields from final response
          const { matchingScore, aiEnhanced, ...consumerData } = consumer;
          return consumerData;
        });

      return res.status(200).json({
        success: true,
        consumers: topMatchingConsumers,
        count: topMatchingConsumers.length,
        aiEnhanced: true
      });

    } catch (aiError) {
      console.error('Error in AI matching, falling back to all consumers:', aiError);
      
      // Fallback: Return all consumers who need storage without product matching
      return res.status(200).json({
        success: true,
        consumers: allConsumers,
        count: allConsumers.length,
        message: 'AI service unavailable - returning all consumers who need storage',
        aiEnhanced: false
      });
    }

  } catch (error) {
    console.error('Error fetching consumers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching consumers',
      error: error.message
    });
  }
};

module.exports = {
  getConsumersForProvider
};