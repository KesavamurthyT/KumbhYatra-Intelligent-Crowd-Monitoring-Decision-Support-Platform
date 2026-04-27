const { body, param, query, validationResult } = require('express-validator');
const { SOS_TYPES, SOS_SEVERITY, SOS_STATUSES } = require('../models/sosModel');

// Validation middleware
const validateSOS = [
  body('type')
    .isIn(Object.values(SOS_TYPES))
    .withMessage(`Type must be one of: ${Object.values(SOS_TYPES).join(', ')}`),
  
  body('severity')
    .isIn(Object.values(SOS_SEVERITY))
    .withMessage(`Severity must be one of: ${Object.values(SOS_SEVERITY).join(', ')}`),
  
  body('message')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Message must be a string with max 1000 characters'),
  
  body('location.lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be a valid number between -90 and 90'),
  
  body('location.lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be a valid number between -180 and 180'),
  
  body('location.text')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Location text must be a string with max 500 characters'),
  
  body('userId')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('User ID must be a non-empty string with max 100 characters'),
  
  body('incidentId')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Incident ID must be a non-empty string with max 100 characters')
];

const validateStatusUpdate = [
  param('id')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Incident ID is required'),
  
  body('status')
    .isIn(Object.values(SOS_STATUSES))
    .withMessage(`Status must be one of: ${Object.values(SOS_STATUSES).join(', ')}`),
  
  body('updatedBy')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Updated by must be a non-empty string with max 100 characters'),
  
  body('assignedTo')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Assigned to must be a string with max 100 characters'),
  
  body('message')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Message must be a string with max 1000 characters')
];

const validateIncidentId = [
  param('id')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Incident ID is required')
];

const validateQuery = [
  query('userId')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('User ID must be a non-empty string with max 100 characters'),
  
  query('status')
    .optional()
    .isIn(Object.values(SOS_STATUSES))
    .withMessage(`Status must be one of: ${Object.values(SOS_STATUSES).join(', ')}`),
  
  query('type')
    .optional()
    .isIn(Object.values(SOS_TYPES))
    .withMessage(`Type must be one of: ${Object.values(SOS_TYPES).join(', ')}`),
  
  query('severity')
    .optional()
    .isIn(Object.values(SOS_SEVERITY))
    .withMessage(`Severity must be one of: ${Object.values(SOS_SEVERITY).join(', ')}`),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be an integer between 1 and 100'),
  
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer')
];

// Error handling middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      ok: false,
      error: 'Validation failed',
      details: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

// Sanitization functions
const sanitizeInput = (req, res, next) => {
  // Remove any potential XSS or injection attempts
  if (req.body.message) {
    req.body.message = req.body.message.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
  
  if (req.body.location && req.body.location.text) {
    req.body.location.text = req.body.location.text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
  
  next();
};

module.exports = {
  validateSOS,
  validateStatusUpdate,
  validateIncidentId,
  validateQuery,
  handleValidationErrors,
  sanitizeInput
};
