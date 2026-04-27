const express = require('express');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const { SOSStorage } = require('../models/sosModel');
const {
  validateSOS,
  validateStatusUpdate,
  validateIncidentId,
  validateQuery,
  handleValidationErrors,
  sanitizeInput
} = require('../middleware/validation');

const router = express.Router();
const sosStorage = new SOSStorage();

// Rate limiting for SOS creation (5 requests per minute per IP)
const sosCreateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    ok: false,
    error: 'Too many SOS requests from this IP, please try again later.',
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

// POST /api/sos - Create new SOS incident
router.post('/sos', 
  sosCreateLimiter,
  validateSOS,
  handleValidationErrors,
  sanitizeInput,
  async (req, res) => {
    try {
      const { type, severity, message, location, userId, incidentId } = req.body;
      
      // Generate incident ID if not provided (for deduplication)
      const finalIncidentId = incidentId || uuidv4();
      
      const incidentData = {
        incidentId: finalIncidentId,
        type,
        severity,
        message: message || '',
        location: {
          lat: parseFloat(location.lat),
          lng: parseFloat(location.lng),
          text: location.text || ''
        },
        userId: userId || null,
        status: 'reported',
        createdAt: new Date().toISOString()
      };

      // Create incident (handles deduplication)
      const incident = await sosStorage.createIncident(incidentData);
      
      console.log(`SOS incident created: ${incident.incidentId} - ${incident.type} (${incident.severity})`);
      
      res.status(201).json({
        ok: true,
        incident: incident.toJSON()
      });
      
    } catch (error) {
      console.error('Error creating SOS incident:', error);
      res.status(500).json({
        ok: false,
        error: 'Failed to create SOS incident',
        message: error.message
      });
    }
  }
);

// GET /api/sos - Get all SOS incidents with optional filtering
router.get('/sos',
  validateQuery,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { userId, status, type, severity, limit = 50, offset = 0 } = req.query;
      
      const filters = {};
      if (userId) filters.userId = userId;
      if (status) filters.status = status;
      if (type) filters.type = type;
      if (severity) filters.severity = severity;
      
      const allIncidents = sosStorage.getAllIncidents(filters);
      
      // Apply pagination
      const paginatedIncidents = allIncidents.slice(
        parseInt(offset),
        parseInt(offset) + parseInt(limit)
      );
      
      const response = {
        ok: true,
        incidents: paginatedIncidents.map(incident => incident.toJSON()),
        pagination: {
          total: allIncidents.length,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + parseInt(limit) < allIncidents.length
        },
        stats: sosStorage.getStats()
      };
      
      res.json(response);
      
    } catch (error) {
      console.error('Error fetching SOS incidents:', error);
      res.status(500).json({
        ok: false,
        error: 'Failed to fetch SOS incidents',
        message: error.message
      });
    }
  }
);

// GET /api/sos/:id - Get single SOS incident
router.get('/sos/:id',
  validateIncidentId,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      
      const incident = sosStorage.getIncident(id);
      
      if (!incident) {
        return res.status(404).json({
          ok: false,
          error: 'SOS incident not found',
          incidentId: id
        });
      }
      
      res.json({
        ok: true,
        incident: incident.toJSON()
      });
      
    } catch (error) {
      console.error('Error fetching SOS incident:', error);
      res.status(500).json({
        ok: false,
        error: 'Failed to fetch SOS incident',
        message: error.message
      });
    }
  }
);

// PATCH /api/sos/:id - Update SOS incident status
router.patch('/sos/:id',
  validateStatusUpdate,
  handleValidationErrors,
  sanitizeInput,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status, updatedBy = 'admin', assignedTo, message } = req.body;
      
      const updates = { status, updatedBy };
      if (assignedTo !== undefined) updates.assignedTo = assignedTo;
      if (message !== undefined) updates.message = message;
      
      const updatedIncident = await sosStorage.updateIncident(id, updates);
      
      if (!updatedIncident) {
        return res.status(404).json({
          ok: false,
          error: 'SOS incident not found',
          incidentId: id
        });
      }
      
      console.log(`SOS incident updated: ${id} - status changed to ${status} by ${updatedBy}`);
      
      res.json({
        ok: true,
        incident: updatedIncident.toJSON()
      });
      
    } catch (error) {
      console.error('Error updating SOS incident:', error);
      
      if (error.message.includes('Invalid status transition')) {
        return res.status(400).json({
          ok: false,
          error: 'Invalid status transition',
          message: error.message
        });
      }
      
      res.status(500).json({
        ok: false,
        error: 'Failed to update SOS incident',
        message: error.message
      });
    }
  }
);

// GET /api/sos/stats - Get SOS statistics (admin only)
router.get('/sos-stats', async (req, res) => {
  try {
    const stats = sosStorage.getStats();
    
    res.json({
      ok: true,
      stats
    });
    
  } catch (error) {
    console.error('Error fetching SOS stats:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to fetch SOS statistics',
      message: error.message
    });
  }
});

// DELETE /api/sos/:id - Delete SOS incident (admin only)
router.delete('/sos/:id',
  validateIncidentId,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      
      const deleted = await sosStorage.deleteIncident(id);
      
      if (!deleted) {
        return res.status(404).json({
          ok: false,
          error: 'SOS incident not found',
          incidentId: id
        });
      }
      
      console.log(`SOS incident deleted: ${id}`);
      
      res.json({
        ok: true,
        message: 'SOS incident deleted successfully',
        incidentId: id
      });
      
    } catch (error) {
      console.error('Error deleting SOS incident:', error);
      res.status(500).json({
        ok: false,
        error: 'Failed to delete SOS incident',
        message: error.message
      });
    }
  }
);

module.exports = router;
