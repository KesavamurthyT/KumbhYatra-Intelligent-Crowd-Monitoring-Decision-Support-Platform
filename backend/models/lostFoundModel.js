const fs = require('fs').promises;
const path = require('path');
const AIMatchingService = require('../services/aiMatchingService');

// Lost and Found Item Status enum
const LOST_FOUND_STATUSES = {
  ACTIVE: 'active',
  CLAIMED: 'claimed',
  RETURNED: 'returned',
  EXPIRED: 'expired'
};

// Lost and Found Item Types enum
const LOST_FOUND_TYPES = {
  BAG: 'bag',
  PHONE: 'phone',
  JEWELRY: 'jewelry',
  DOCUMENTS: 'documents',
  CLOTHING: 'clothing',
  ELECTRONICS: 'electronics',
  OTHER: 'other'
};

// Submitter types
const SUBMITTER_TYPES = {
  PILGRIM: 'pilgrim',
  VOLUNTEER: 'volunteer',
  ADMIN: 'admin'
};

// Status transition rules
const ALLOWED_STATUS_TRANSITIONS = {
  [LOST_FOUND_STATUSES.ACTIVE]: [LOST_FOUND_STATUSES.CLAIMED, LOST_FOUND_STATUSES.RETURNED, LOST_FOUND_STATUSES.EXPIRED],
  [LOST_FOUND_STATUSES.CLAIMED]: [LOST_FOUND_STATUSES.RETURNED],
  [LOST_FOUND_STATUSES.RETURNED]: [],
  [LOST_FOUND_STATUSES.EXPIRED]: []
};

class LostFoundItem {
  constructor(data) {
    this.id = data.id;
    this.type = data.type;
    this.description = data.description;
    this.location = data.location;
    this.status = data.status || LOST_FOUND_STATUSES.ACTIVE;
    this.submittedBy = data.submittedBy || SUBMITTER_TYPES.PILGRIM;
    this.timestamp = data.timestamp || Date.now();
    this.photos = data.photos || [];
    this.contactInfo = data.contactInfo || '';
    this.matchConfidence = data.matchConfidence || null;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.statusHistory = data.statusHistory || [{
      status: this.status,
      timestamp: this.createdAt,
      updatedBy: this.submittedBy
    }];
    this.claimedBy = data.claimedBy || null;
    this.claimedAt = data.claimedAt || null;
    this.returnedAt = data.returnedAt || null;
    this.expiresAt = data.expiresAt || this.calculateExpiryDate();
    this.tags = data.tags || [];
    this.priority = this.calculatePriority();
  }

  calculateExpiryDate() {
    // Items expire after 30 days
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    return expiryDate.toISOString();
  }

  calculatePriority() {
    const typeScore = {
      [LOST_FOUND_TYPES.DOCUMENTS]: 4,
      [LOST_FOUND_TYPES.PHONE]: 3,
      [LOST_FOUND_TYPES.JEWELRY]: 3,
      [LOST_FOUND_TYPES.ELECTRONICS]: 2,
      [LOST_FOUND_TYPES.BAG]: 2,
      [LOST_FOUND_TYPES.CLOTHING]: 1,
      [LOST_FOUND_TYPES.OTHER]: 1
    };

    const submitterScore = {
      [SUBMITTER_TYPES.VOLUNTEER]: 2,
      [SUBMITTER_TYPES.ADMIN]: 2,
      [SUBMITTER_TYPES.PILGRIM]: 1
    };

    return (typeScore[this.type] || 1) * (submitterScore[this.submittedBy] || 1);
  }

  updateStatus(newStatus, updatedBy = 'admin') {
    if (!ALLOWED_STATUS_TRANSITIONS[this.status].includes(newStatus)) {
      throw new Error(`Invalid status transition from ${this.status} to ${newStatus}`);
    }

    const oldStatus = this.status;
    this.status = newStatus;
    this.updatedAt = new Date().toISOString();
    
    this.statusHistory.push({
      status: newStatus,
      timestamp: this.updatedAt,
      updatedBy,
      previousStatus: oldStatus
    });

    // Set specific timestamps based on status
    if (newStatus === LOST_FOUND_STATUSES.CLAIMED) {
      this.claimedAt = this.updatedAt;
    } else if (newStatus === LOST_FOUND_STATUSES.RETURNED) {
      this.returnedAt = this.updatedAt;
    }
  }

  addPhoto(photoUrl) {
    this.photos.push(photoUrl);
    this.updatedAt = new Date().toISOString();
  }

  addTag(tag) {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
      this.updatedAt = new Date().toISOString();
    }
  }

  setMatchConfidence(confidence) {
    this.matchConfidence = confidence;
    this.updatedAt = new Date().toISOString();
  }

  isExpired() {
    return new Date() > new Date(this.expiresAt);
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      description: this.description,
      location: this.location,
      status: this.status,
      submittedBy: this.submittedBy,
      timestamp: this.timestamp,
      photos: this.photos,
      contactInfo: this.contactInfo,
      matchConfidence: this.matchConfidence,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      statusHistory: this.statusHistory,
      claimedBy: this.claimedBy,
      claimedAt: this.claimedAt,
      returnedAt: this.returnedAt,
      expiresAt: this.expiresAt,
      tags: this.tags,
      priority: this.priority,
      isExpired: this.isExpired()
    };
  }
}

class LostFoundStorage {
  constructor() {
    this.items = new Map(); // In-memory storage
    this.dataFile = path.join(__dirname, 'data', 'lost-found-items.json');
    this.aiMatchingService = new AIMatchingService();
    this.loadFromFile();
  }

  async loadFromFile() {
    try {
      // Ensure data directory exists
      await fs.mkdir(path.dirname(this.dataFile), { recursive: true });
      
      const data = await fs.readFile(this.dataFile, 'utf8');
      const items = JSON.parse(data);
      
      // Load items into memory
      items.forEach(itemData => {
        const item = new LostFoundItem(itemData);
        this.items.set(item.id, item);
      });
      
      console.log(`Loaded ${this.items.size} Lost & Found items from file`);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error('Error loading Lost & Found items from file:', error);
      }
      // File doesn't exist or is invalid, start with empty storage
    }
  }

  async saveToFile() {
    try {
      const items = Array.from(this.items.values()).map(item => item.toJSON());
      await fs.writeFile(this.dataFile, JSON.stringify(items, null, 2));
    } catch (error) {
      console.error('Error saving Lost & Found items to file:', error);
    }
  }

  async createItem(itemData) {
    // Check for existing item with same ID (deduplication)
    if (this.items.has(itemData.id)) {
      return this.items.get(itemData.id);
    }

    const item = new LostFoundItem(itemData);
    this.items.set(item.id, item);
    
    // Persist to file
    await this.saveToFile();
    
    return item;
  }

  getItem(itemId) {
    return this.items.get(itemId);
  }

  getAllItems(filters = {}) {
    let items = Array.from(this.items.values());

    // Apply filters
    if (filters.status) {
      items = items.filter(item => item.status === filters.status);
    }

    if (filters.type) {
      items = items.filter(item => item.type === filters.type);
    }

    if (filters.submittedBy) {
      items = items.filter(item => item.submittedBy === filters.submittedBy);
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      items = items.filter(item => 
        item.description.toLowerCase().includes(searchTerm) ||
        item.location.toLowerCase().includes(searchTerm) ||
        item.type.toLowerCase().includes(searchTerm) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    if (filters.expired !== undefined) {
      items = items.filter(item => item.isExpired() === filters.expired);
    }

    // Sort by priority and timestamp (highest priority first, then newest)
    items.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return new Date(b.timestamp) - new Date(a.timestamp);
    });

    return items;
  }

  async updateItem(itemId, updates) {
    const item = this.items.get(itemId);
    if (!item) {
      return null;
    }

    // Update allowed fields
    if (updates.status) {
      item.updateStatus(updates.status, updates.updatedBy);
    }

    if (updates.description !== undefined) {
      item.description = updates.description;
      item.updatedAt = new Date().toISOString();
    }

    if (updates.location !== undefined) {
      item.location = updates.location;
      item.updatedAt = new Date().toISOString();
    }

    if (updates.contactInfo !== undefined) {
      item.contactInfo = updates.contactInfo;
      item.updatedAt = new Date().toISOString();
    }

    if (updates.claimedBy !== undefined) {
      item.claimedBy = updates.claimedBy;
      item.updatedAt = new Date().toISOString();
    }

    if (updates.photos) {
      item.photos = updates.photos;
      item.updatedAt = new Date().toISOString();
    }

    if (updates.tags) {
      item.tags = updates.tags;
      item.updatedAt = new Date().toISOString();
    }

    // Persist to file
    await this.saveToFile();

    return item;
  }

  async deleteItem(itemId) {
    const deleted = this.items.delete(itemId);
    if (deleted) {
      await this.saveToFile();
    }
    return deleted;
  }

  // AI matching functionality using the AI matching service
  async findMatches(searchCriteria) {
    const items = Array.from(this.items.values());
    const matches = await this.aiMatchingService.findEnhancedMatches(searchCriteria, items);
    
    return matches.map(match => ({
      item: match.item.toJSON(),
      confidence: match.confidence,
      matchFactors: match.matchFactors,
      quality: match.quality,
      totalScore: match.totalScore
    }));
  }

  getStats() {
    const items = Array.from(this.items.values());
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      total: items.length,
      byStatus: this.groupBy(items, 'status'),
      byType: this.groupBy(items, 'type'),
      bySubmitter: this.groupBy(items, 'submittedBy'),
      recent: {
        last24Hours: items.filter(i => new Date(i.createdAt) > last24Hours).length,
        last7Days: items.filter(i => new Date(i.createdAt) > last7Days).length
      },
      expired: items.filter(i => i.isExpired()).length,
      active: items.filter(i => i.status === LOST_FOUND_STATUSES.ACTIVE && !i.isExpired()).length
    };
  }

  groupBy(array, key) {
    return array.reduce((result, item) => {
      const group = item[key];
      if (!result[group]) {
        result[group] = 0;
      }
      result[group]++;
      return result;
    }, {});
  }

  // Clean up expired items (can be called periodically)
  async cleanupExpiredItems() {
    const expiredItems = Array.from(this.items.values())
      .filter(item => item.isExpired() && item.status === LOST_FOUND_STATUSES.ACTIVE);

    for (const item of expiredItems) {
      item.updateStatus(LOST_FOUND_STATUSES.EXPIRED, 'system');
    }

    if (expiredItems.length > 0) {
      await this.saveToFile();
      console.log(`Marked ${expiredItems.length} items as expired`);
    }

    return expiredItems.length;
  }
}

module.exports = {
  LostFoundItem,
  LostFoundStorage,
  LOST_FOUND_STATUSES,
  LOST_FOUND_TYPES,
  SUBMITTER_TYPES,
  ALLOWED_STATUS_TRANSITIONS
};
