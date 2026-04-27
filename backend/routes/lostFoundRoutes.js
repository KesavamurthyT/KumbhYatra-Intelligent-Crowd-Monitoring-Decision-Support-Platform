const express = require('express');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const { LostFoundStorage } = require('../models/lostFoundModel');
const {
  validateLostFoundItem,
  validateLostFoundUpdate,
  validateItemId,
  validateLostFoundQuery,
  validateAIMatch,
  handleValidationErrors,
  sanitizeLostFoundInput
} = require('../middleware/lostFoundValidation');

const router = express.Router();
const lostFoundStorage = new LostFoundStorage();

// Rate limiting for item creation (10 requests per minute per IP)
const itemCreateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    ok: false,
    error: 'Too many item creation requests from this IP, please try again later.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for AI matching (5 requests per minute per IP)
const aiMatchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    ok: false,
    error: 'Too many AI matching requests from this IP, please try again later.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for general API access (30 requests per minute per IP)
const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 requests per windowMs
  message: {
    ok: false,
    error: 'Too many API requests from this IP, please try again later.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general rate limiting to all routes
router.use(generalLimiter);

// POST /api/lost-found - Create new lost/found item
router.post('/lost-found', 
  itemCreateLimiter,
  validateLostFoundItem,
  handleValidationErrors,
  sanitizeLostFoundInput,
  async (req, res) => {
    try {
      const { type, description, location, contactInfo, submittedBy, photos, tags } = req.body;
      
      const itemData = {
        id: `item_${Date.now()}_${uuidv4().slice(0, 8)}`,
        type,
        description,
        location,
        contactInfo: contactInfo || '',
        submittedBy: submittedBy || 'pilgrim',
        photos: photos || [],
        tags: tags || [],
        timestamp: Date.now()
      };

      const item = await lostFoundStorage.createItem(itemData);
      
      console.log(`Lost & Found item created: ${item.id} - ${item.type} (${item.status})`);
      
      res.status(201).json({
        ok: true,
        item: item.toJSON()
      });
      
    } catch (error) {
      console.error('Error creating Lost & Found item:', error);
      res.status(500).json({
        ok: false,
        error: 'Failed to create Lost & Found item',
        message: error.message
      });
    }
  }
);

// GET /api/lost-found - Get all lost/found items with optional filtering
router.get('/lost-found',
  validateLostFoundQuery,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { status, type, submittedBy, search, expired, limit = 50, offset = 0 } = req.query;
      
      const filters = {};
      if (status) filters.status = status;
      if (type) filters.type = type;
      if (submittedBy) filters.submittedBy = submittedBy;
      if (search) filters.search = search;
      if (expired !== undefined) filters.expired = expired === 'true';
      
      const allItems = lostFoundStorage.getAllItems(filters);
      
      // Apply pagination
      const paginatedItems = allItems.slice(
        parseInt(offset),
        parseInt(offset) + parseInt(limit)
      );
      
      const response = {
        ok: true,
        items: paginatedItems.map(item => item.toJSON()),
        pagination: {
          total: allItems.length,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + parseInt(limit) < allItems.length
        },
        stats: lostFoundStorage.getStats()
      };
      
      res.json(response);
      
    } catch (error) {
      console.error('Error fetching Lost & Found items:', error);
      res.status(500).json({
        ok: false,
        error: 'Failed to fetch Lost & Found items',
        message: error.message
      });
    }
  }
);

// GET /api/lost-found/stats - Get Lost & Found statistics (must come before /:id route)
router.get('/lost-found/stats', async (req, res) => {
  try {
    const stats = lostFoundStorage.getStats();
    
    res.json({
      ok: true,
      stats
    });
    
  } catch (error) {
    console.error('Error fetching Lost & Found stats:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to fetch Lost & Found statistics',
      message: error.message
    });
  }
});

// GET /api/lost-found/types - Get available item types (must come before /:id route)
router.get('/lost-found/types', (req, res) => {
  const { LOST_FOUND_TYPES } = require('../models/lostFoundModel');
  
  res.json({
    ok: true,
    types: Object.values(LOST_FOUND_TYPES).map(type => ({
      value: type,
      label: type.charAt(0).toUpperCase() + type.slice(1)
    }))
  });
});

// GET /api/lost-found/statuses - Get available statuses (must come before /:id route)
router.get('/lost-found/statuses', (req, res) => {
  const { LOST_FOUND_STATUSES } = require('../models/lostFoundModel');
  
  res.json({
    ok: true,
    statuses: Object.values(LOST_FOUND_STATUSES).map(status => ({
      value: status,
      label: status.charAt(0).toUpperCase() + status.slice(1)
    }))
  });
});

// GET /api/lost-found/:id - Get single lost/found item
router.get('/lost-found/:id',
  validateItemId,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      
      const item = lostFoundStorage.getItem(id);
      
      if (!item) {
        return res.status(404).json({
          ok: false,
          error: 'Lost & Found item not found',
          itemId: id
        });
      }
      
      res.json({
        ok: true,
        item: item.toJSON()
      });
      
    } catch (error) {
      console.error('Error fetching Lost & Found item:', error);
      res.status(500).json({
        ok: false,
        error: 'Failed to fetch Lost & Found item',
        message: error.message
      });
    }
  }
);

// PATCH /api/lost-found/:id - Update lost/found item
router.patch('/lost-found/:id',
  validateLostFoundUpdate,
  handleValidationErrors,
  sanitizeLostFoundInput,
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const updatedItem = await lostFoundStorage.updateItem(id, updates);
      
      if (!updatedItem) {
        return res.status(404).json({
          ok: false,
          error: 'Lost & Found item not found',
          itemId: id
        });
      }
      
      console.log(`Lost & Found item updated: ${id} - status: ${updatedItem.status}`);
      
      res.json({
        ok: true,
        item: updatedItem.toJSON()
      });
      
    } catch (error) {
      console.error('Error updating Lost & Found item:', error);
      
      if (error.message.includes('Invalid status transition')) {
        return res.status(400).json({
          ok: false,
          error: 'Invalid status transition',
          message: error.message
        });
      }
      
      res.status(500).json({
        ok: false,
        error: 'Failed to update Lost & Found item',
        message: error.message
      });
    }
  }
);

// DELETE /api/lost-found/:id - Delete lost/found item
router.delete('/lost-found/:id',
  validateItemId,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      
      const deleted = await lostFoundStorage.deleteItem(id);
      
      if (!deleted) {
        return res.status(404).json({
          ok: false,
          error: 'Lost & Found item not found',
          itemId: id
        });
      }
      
      console.log(`Lost & Found item deleted: ${id}`);
      
      res.json({
        ok: true,
        message: 'Lost & Found item deleted successfully',
        itemId: id
      });
      
    } catch (error) {
      console.error('Error deleting Lost & Found item:', error);
      res.status(500).json({
        ok: false,
        error: 'Failed to delete Lost & Found item',
        message: error.message
      });
    }
  }
);

// POST /api/lost-found/ai-match - AI-powered matching for lost items
router.post('/lost-found/ai-match',
  aiMatchLimiter,
  validateAIMatch,
  handleValidationErrors,
  sanitizeLostFoundInput,
  async (req, res) => {
    try {
      const { description, type, location, photos } = req.body;
      
      const searchCriteria = {
        description,
        type,
        location,
        photos
      };
      
      const matches = await lostFoundStorage.findMatches(searchCriteria);
      
      console.log(`AI matching completed: found ${matches.length} potential matches`);
      
      res.json({
        ok: true,
        matches,
        searchCriteria,
        totalMatches: matches.length
      });
      
    } catch (error) {
      console.error('Error in AI matching:', error);
      res.status(500).json({
        ok: false,
        error: 'Failed to perform AI matching',
        message: error.message
      });
    }
  }
);

// POST /api/lost-found/cleanup - Clean up expired items (admin only)
router.post('/lost-found/cleanup', async (req, res) => {
  try {
    const cleanedCount = await lostFoundStorage.cleanupExpiredItems();
    
    res.json({
      ok: true,
      message: `Cleaned up ${cleanedCount} expired items`,
      cleanedCount
    });
    
  } catch (error) {
    console.error('Error cleaning up expired items:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to clean up expired items',
      message: error.message
    });
  }
});

module.exports = router;
