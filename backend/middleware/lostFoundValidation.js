const { body, param, query, validationResult } = require('express-validator');
const { LOST_FOUND_TYPES, LOST_FOUND_STATUSES, SUBMITTER_TYPES } = require('../models/lostFoundModel');

// Validation middleware for Lost and Found items
const validateLostFoundItem = [
  body('type')
    .isIn(Object.values(LOST_FOUND_TYPES))
    .withMessage(`Type must be one of: ${Object.values(LOST_FOUND_TYPES).join(', ')}`),
  
  body('description')
    .isString()
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Description must be a string between 5 and 500 characters'),
  
  body('location')
    .isString()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Location must be a string between 2 and 200 characters'),
  
  body('contactInfo')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Contact info must be a string with max 100 characters'),
  
  body('submittedBy')
    .optional()
    .isIn(Object.values(SUBMITTER_TYPES))
    .withMessage(`Submitted by must be one of: ${Object.values(SUBMITTER_TYPES).join(', ')}`),
  
  body('photos')
    .optional()
    .isArray()
    .withMessage('Photos must be an array'),
  
  body('photos.*')
    .optional()
    .isString()
    .isURL()
    .withMessage('Each photo must be a valid URL'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be a string between 1 and 50 characters')
];

const validateLostFoundUpdate = [
  param('id')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Item ID is required'),
  
  body('status')
    .optional()
    .isIn(Object.values(LOST_FOUND_STATUSES))
    .withMessage(`Status must be one of: ${Object.values(LOST_FOUND_STATUSES).join(', ')}`),
  
  body('description')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Description must be a string between 5 and 500 characters'),
  
  body('location')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Location must be a string between 2 and 200 characters'),
  
  body('contactInfo')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Contact info must be a string with max 100 characters'),
  
  body('claimedBy')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Claimed by must be a string between 1 and 100 characters'),
  
  body('updatedBy')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Updated by must be a string between 1 and 100 characters'),
  
  body('photos')
    .optional()
    .isArray()
    .withMessage('Photos must be an array'),
  
  body('photos.*')
    .optional()
    .isString()
    .isURL()
    .withMessage('Each photo must be a valid URL'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be a string between 1 and 50 characters')
];

const validateItemId = [
  param('id')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Item ID is required')
];

const validateLostFoundQuery = [
  query('status')
    .optional()
    .isIn(Object.values(LOST_FOUND_STATUSES))
    .withMessage(`Status must be one of: ${Object.values(LOST_FOUND_STATUSES).join(', ')}`),
  
  query('type')
    .optional()
    .isIn(Object.values(LOST_FOUND_TYPES))
    .withMessage(`Type must be one of: ${Object.values(LOST_FOUND_TYPES).join(', ')}`),
  
  query('submittedBy')
    .optional()
    .isIn(Object.values(SUBMITTER_TYPES))
    .withMessage(`Submitted by must be one of: ${Object.values(SUBMITTER_TYPES).join(', ')}`),
  
  query('search')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be a string between 1 and 100 characters'),
  
  query('expired')
    .optional()
    .isBoolean()
    .withMessage('Expired filter must be a boolean'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be an integer between 1 and 100'),
  
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer')
];

const validateAIMatch = [
  body('description')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Description must be a string between 5 and 500 characters'),
  
  body('type')
    .optional()
    .isIn(Object.values(LOST_FOUND_TYPES))
    .withMessage(`Type must be one of: ${Object.values(LOST_FOUND_TYPES).join(', ')}`),
  
  body('location')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Location must be a string between 2 and 200 characters'),
  
  body('photos')
    .optional()
    .isArray()
    .withMessage('Photos must be an array'),
  
  body('photos.*')
    .optional()
    .isString()
    .isURL()
    .withMessage('Each photo must be a valid URL')
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
const sanitizeLostFoundInput = (req, res, next) => {
  // Remove any potential XSS or injection attempts
  if (req.body.description) {
    req.body.description = req.body.description.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
  
  if (req.body.location) {
    req.body.location = req.body.location.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
  
  if (req.body.contactInfo) {
    req.body.contactInfo = req.body.contactInfo.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
  
  if (req.body.claimedBy) {
    req.body.claimedBy = req.body.claimedBy.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
  
  if (req.body.updatedBy) {
    req.body.updatedBy = req.body.updatedBy.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
  
  // Sanitize tags
  if (req.body.tags && Array.isArray(req.body.tags)) {
    req.body.tags = req.body.tags.map(tag => 
      tag.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').trim()
    ).filter(tag => tag.length > 0);
  }
  
  next();
};

module.exports = {
  validateLostFoundItem,
  validateLostFoundUpdate,
  validateItemId,
  validateLostFoundQuery,
  validateAIMatch,
  handleValidationErrors,
  sanitizeLostFoundInput
};
