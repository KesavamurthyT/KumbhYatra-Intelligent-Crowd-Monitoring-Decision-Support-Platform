const fs = require('fs').promises;
const path = require('path');

/**
 * AI Matching Service for Lost and Found Items
 * 
 * This service provides intelligent matching capabilities for lost and found items
 * using text analysis, image comparison, and location-based matching.
 */

class AIMatchingService {
  constructor() {
    this.similarityThreshold = 0.3; // Minimum similarity score for matches
    this.maxMatches = 10; // Maximum number of matches to return
    this.geminiApiKey = process.env.AI_API || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GENERATIVE_LANGUAGE_API_KEY || '';
    this.geminiModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  }

  /**
   * Perform comprehensive matching based on multiple criteria
   * @param {Object} searchCriteria - Search parameters
   * @param {Array} items - Array of items to search through
   * @returns {Array} Array of matches with confidence scores
   */
  async findMatches(searchCriteria, items) {
    const { description, type, location, photos } = searchCriteria;
    const matches = [];

    // Filter active, non-expired items
    const activeItems = items.filter(item => 
      item.status === 'active' && !item.isExpired()
    );

    for (const item of activeItems) {
      let totalScore = 0;
      let matchFactors = [];

      // Text-based matching (description similarity)
      if (description) {
        const textScore = this.calculateTextSimilarity(description, item.description);
        if (textScore > 0) {
          totalScore += textScore * 0.4; // 40% weight for text similarity
          matchFactors.push({
            type: 'text',
            score: textScore,
            details: this.getTextMatchDetails(description, item.description)
          });
        }
      }

      // Type matching
      if (type && item.type === type) {
        totalScore += 0.3; // 30% weight for exact type match
        matchFactors.push({
          type: 'type',
          score: 1.0,
          details: `Exact type match: ${type}`
        });
      }

      // Location matching
      if (location) {
        const locationScore = this.calculateLocationSimilarity(location, item.location);
        if (locationScore > 0) {
          totalScore += locationScore * 0.2; // 20% weight for location
          matchFactors.push({
            type: 'location',
            score: locationScore,
            details: this.getLocationMatchDetails(location, item.location)
          });
        }
      }

      // Image matching (if photos provided)
      if (photos && photos.length > 0 && item.photos && item.photos.length > 0) {
        const imageScore = await this.calculateImageSimilarity(photos, item.photos);
        if (imageScore > 0) {
          totalScore += imageScore * 0.1; // 10% weight for image similarity
          matchFactors.push({
            type: 'image',
            score: imageScore,
            details: `Image similarity: ${Math.round(imageScore * 100)}%`
          });
        }
      }

      // Only include matches above threshold
      if (totalScore >= this.similarityThreshold) {
        matches.push({
          item: item,
          confidence: Math.min(Math.round(totalScore * 100), 100),
          matchFactors: matchFactors,
          totalScore: totalScore
        });
      }
    }

    // Sort by confidence and return top matches
    return matches
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, this.maxMatches);
  }

  /**
   * Calculate text similarity between two descriptions
   * @param {string} text1 - First text
   * @param {string} text2 - Second text
   * @returns {number} Similarity score between 0 and 1
   */
  calculateTextSimilarity(text1, text2) {
    const words1 = this.tokenize(text1);
    const words2 = this.tokenize(text2);

    if (words1.length === 0 || words2.length === 0) return 0;

    // Calculate Jaccard similarity
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    const jaccardSimilarity = intersection.size / union.size;

    // Calculate word order similarity
    const orderSimilarity = this.calculateWordOrderSimilarity(words1, words2);

    // Combine both metrics
    return (jaccardSimilarity * 0.7) + (orderSimilarity * 0.3);
  }

  /**
   * Tokenize text into words, removing common stop words
   * @param {string} text - Text to tokenize
   * @returns {Array} Array of meaningful words
   */
  tokenize(text) {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
    ]);

    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));
  }

  /**
   * Calculate word order similarity
   * @param {Array} words1 - First word array
   * @param {Array} words2 - Second word array
   * @returns {number} Order similarity score
   */
  calculateWordOrderSimilarity(words1, words2) {
    const commonWords = words1.filter(word => words2.includes(word));
    if (commonWords.length === 0) return 0;

    let orderMatches = 0;
    for (let i = 0; i < commonWords.length - 1; i++) {
      const word1 = commonWords[i];
      const word2 = commonWords[i + 1];
      
      const pos1_1 = words1.indexOf(word1);
      const pos1_2 = words1.indexOf(word2);
      const pos2_1 = words2.indexOf(word1);
      const pos2_2 = words2.indexOf(word2);

      if (pos1_1 < pos1_2 && pos2_1 < pos2_2) {
        orderMatches++;
      }
    }

    return orderMatches / Math.max(commonWords.length - 1, 1);
  }

  /**
   * Calculate location similarity
   * @param {string} location1 - First location
   * @param {string} location2 - Second location
   * @returns {number} Location similarity score
   */
  calculateLocationSimilarity(location1, location2) {
    const loc1 = location1.toLowerCase();
    const loc2 = location2.toLowerCase();

    // Exact match
    if (loc1 === loc2) return 1.0;

    // Contains match
    if (loc1.includes(loc2) || loc2.includes(loc1)) return 0.8;

    // Word-based similarity
    const words1 = this.tokenize(location1);
    const words2 = this.tokenize(location2);

    if (words1.length === 0 || words2.length === 0) return 0;

    const commonWords = words1.filter(word => words2.includes(word));
    return commonWords.length / Math.max(words1.length, words2.length);
  }

  /**
   * Calculate image similarity (placeholder for actual image analysis)
   * @param {Array} photos1 - First set of photos
   * @param {Array} photos2 - Second set of photos
   * @returns {number} Image similarity score
   */
  async calculateImageSimilarity(photos1, photos2) {
    // This is a placeholder implementation
    // In a real application, you would use computer vision APIs like:
    // - Google Vision API
    // - AWS Rekognition
    // - Azure Computer Vision
    // - Custom ML models

    // For now, we'll simulate image matching based on URL patterns
    // and return a random score to demonstrate the functionality
    
    const hasSimilarUrls = photos1.some(photo1 => 
      photos2.some(photo2 => this.compareImageUrls(photo1, photo2))
    );

    if (hasSimilarUrls) {
      return 0.7; // High confidence for similar URLs
    }

    // Simulate some random matching for demonstration
    return Math.random() * 0.3; // Low random score
  }

  /**
   * Compare image URLs for similarity (placeholder)
   * @param {string} url1 - First image URL
   * @param {string} url2 - Second image URL
   * @returns {boolean} Whether URLs are similar
   */
  compareImageUrls(url1, url2) {
    // Extract filename or hash from URLs for comparison
    const filename1 = path.basename(url1).split('.')[0];
    const filename2 = path.basename(url2).split('.')[0];
    
    return filename1 === filename2 || 
           filename1.includes(filename2) || 
           filename2.includes(filename1);
  }

  /**
   * Get detailed text match information
   * @param {string} searchText - Search text
   * @param {string} itemText - Item text
   * @returns {string} Match details
   */
  getTextMatchDetails(searchText, itemText) {
    const searchWords = this.tokenize(searchText);
    const itemWords = this.tokenize(itemText);
    const commonWords = searchWords.filter(word => itemWords.includes(word));
    
    return `Common words: ${commonWords.join(', ')}`;
  }

  /**
   * Get detailed location match information
   * @param {string} searchLocation - Search location
   * @param {string} itemLocation - Item location
   * @returns {string} Location match details
   */
  getLocationMatchDetails(searchLocation, itemLocation) {
    const searchWords = this.tokenize(searchLocation);
    const itemWords = this.tokenize(itemLocation);
    const commonWords = searchWords.filter(word => itemWords.includes(word));
    
    return `Common location words: ${commonWords.join(', ')}`;
  }

  /**
   * Enhanced matching with machine learning features
   * @param {Object} searchCriteria - Search parameters
   * @param {Array} items - Items to search
   * @returns {Array} Enhanced matches
   */
  async findEnhancedMatches(searchCriteria, items) {
    const basicMatches = await this.findMatches(searchCriteria, items);
    let enhanced = basicMatches.map(match => {
      // Boost confidence for items with photos
      if (match.item.photos && match.item.photos.length > 0) {
        match.confidence = Math.min(match.confidence + 5, 100);
      }

      // Boost confidence for recent items
      const daysSinceCreated = (Date.now() - match.item.timestamp) / (1000 * 60 * 60 * 24);
      if (daysSinceCreated < 1) {
        match.confidence = Math.min(match.confidence + 10, 100);
      } else if (daysSinceCreated < 7) {
        match.confidence = Math.min(match.confidence + 5, 100);
      }

      // Add match quality indicators
      match.quality = this.assessMatchQuality(match);
      
      return match;
    }).sort((a, b) => b.confidence - a.confidence);

    // If Gemini API key present, re-rank top candidates with LLM scoring
    if (this.geminiApiKey) {
      const topForLLM = enhanced.slice(0, Math.min(6, enhanced.length));
      const reranked = [];
      for (const m of topForLLM) {
        try {
          const llmScore = await this.scoreWithGemini(searchCriteria, m.item);
          // Blend: 60% existing, 40% LLM
          const blended = Math.round(Math.min(100, (0.6 * m.confidence) + (0.4 * (llmScore * 100))));
          reranked.push({ ...m, confidence: blended });
        } catch (_) {
          reranked.push(m);
        }
      }
      // Keep the rest unchanged, then re-sort
      enhanced = [...reranked, ...enhanced.slice(topForLLM.length)].sort((a, b) => b.confidence - a.confidence);
      enhanced = enhanced.map(m => ({ ...m, quality: this.assessMatchQuality(m) }));
    }

    return enhanced;
  }

  /**
   * Assess the quality of a match
   * @param {Object} match - Match object
   * @returns {string} Quality assessment
   */
  assessMatchQuality(match) {
    if (match.confidence >= 80) return 'high';
    if (match.confidence >= 60) return 'medium';
    if (match.confidence >= 40) return 'low';
    return 'very-low';
  }

  /**
   * Get matching statistics
   * @param {Array} matches - Array of matches
   * @returns {Object} Statistics
   */
  getMatchStatistics(matches) {
    return {
      totalMatches: matches.length,
      highQuality: matches.filter(m => m.quality === 'high').length,
      mediumQuality: matches.filter(m => m.quality === 'medium').length,
      lowQuality: matches.filter(m => m.quality === 'low').length,
      averageConfidence: matches.length > 0 ? 
        Math.round(matches.reduce((sum, m) => sum + m.confidence, 0) / matches.length) : 0,
      matchTypes: this.groupMatchesByType(matches)
    };
  }

  /**
   * Group matches by type
   * @param {Array} matches - Array of matches
   * @returns {Object} Grouped matches
   */
  groupMatchesByType(matches) {
    return matches.reduce((groups, match) => {
      match.matchFactors.forEach(factor => {
        if (!groups[factor.type]) {
          groups[factor.type] = 0;
        }
        groups[factor.type]++;
      });
      return groups;
    }, {});
  }

  /**
   * Score a candidate item against search criteria using Gemini
   * Returns a score in [0,1]
   */
  async scoreWithGemini(criteria, item) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.geminiModel}:generateContent?key=${encodeURIComponent(this.geminiApiKey)}`;
    const prompt = [
      'You are a matching engine for a Lost & Found system.',
      'Given a LOST item criteria and a FOUND item candidate, output ONLY a JSON object with a single field "score" between 0 and 1 representing match likelihood.',
      'Consider: item type, salient keywords in description, distinctive attributes (brand/color/damage), and location proximity textually.',
      'Do not include any extra text besides the JSON.',
      '',
      'CRITERIA:',
      `type: ${criteria.type || ''}`,
      `description: ${criteria.description || ''}`,
      `location: ${criteria.location || ''}`,
      '',
      'CANDIDATE:',
      `type: ${item.type || ''}`,
      `description: ${item.description || ''}`,
      `location: ${item.location || ''}`,
    ].join('\n');

    const body = {
      contents: [
        { role: 'user', parts: [{ text: prompt }] }
      ]
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
    const data = await res.json();
    // Extract text
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    // Try parse JSON
    let score = 0;
    try {
      const parsed = JSON.parse(text);
      if (typeof parsed.score === 'number') score = Math.max(0, Math.min(1, parsed.score));
    } catch (_) {
      // fallback: try to find a number
      const m = text.match(/([0-1](?:\.\d+)?)/);
      if (m) score = Math.max(0, Math.min(1, parseFloat(m[1])));
    }
    return score;
  }
}

module.exports = AIMatchingService;
