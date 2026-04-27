const fs = require('fs').promises;
const path = require('path');

// SOS Incident Status enum
const SOS_STATUSES = {
  REPORTED: 'reported',
  ACKNOWLEDGED: 'acknowledged',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CANCELLED: 'cancelled'
};

// SOS Type enum
const SOS_TYPES = {
  MEDICAL: 'medical',
  SECURITY: 'security',
  FIRE: 'fire',
  LOST_PERSON: 'lost_person',
  CROWD_CONTROL: 'crowd_control',
  OTHER: 'other'
};

// Severity levels
const SOS_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Status transition rules
const ALLOWED_STATUS_TRANSITIONS = {
  [SOS_STATUSES.REPORTED]: [SOS_STATUSES.ACKNOWLEDGED, SOS_STATUSES.CANCELLED],
  [SOS_STATUSES.ACKNOWLEDGED]: [SOS_STATUSES.IN_PROGRESS, SOS_STATUSES.CANCELLED],
  [SOS_STATUSES.IN_PROGRESS]: [SOS_STATUSES.RESOLVED, SOS_STATUSES.CANCELLED],
  [SOS_STATUSES.RESOLVED]: [],
  [SOS_STATUSES.CANCELLED]: []
};

class SOSIncident {
  constructor(data) {
    this.incidentId = data.incidentId;
    this.type = data.type;
    this.severity = data.severity;
    this.message = data.message || '';
    this.location = {
      lat: data.location.lat,
      lng: data.location.lng,
      text: data.location.text || ''
    };
    this.userId = data.userId || null;
    this.status = data.status || SOS_STATUSES.REPORTED;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.statusHistory = data.statusHistory || [{
      status: this.status,
      timestamp: this.createdAt,
      updatedBy: 'system'
    }];
    this.assignedTo = data.assignedTo || null;
    this.priority = this.calculatePriority();
  }

  calculatePriority() {
    const severityScore = {
      [SOS_SEVERITY.LOW]: 1,
      [SOS_SEVERITY.MEDIUM]: 2,
      [SOS_SEVERITY.HIGH]: 3,
      [SOS_SEVERITY.CRITICAL]: 4
    };
    
    const typeScore = {
      [SOS_TYPES.MEDICAL]: 4,
      [SOS_TYPES.FIRE]: 4,
      [SOS_TYPES.SECURITY]: 3,
      [SOS_TYPES.CROWD_CONTROL]: 2,
      [SOS_TYPES.LOST_PERSON]: 2,
      [SOS_TYPES.OTHER]: 1
    };

    return (severityScore[this.severity] || 1) * (typeScore[this.type] || 1);
  }

  updateStatus(newStatus, updatedBy = 'admin') {
    if (!ALLOWED_STATUS_TRANSITIONS[this.status].includes(newStatus)) {
      throw new Error(`Invalid status transition from ${this.status} to ${newStatus}`);
    }

    this.status = newStatus;
    this.updatedAt = new Date().toISOString();
    this.statusHistory.push({
      status: newStatus,
      timestamp: this.updatedAt,
      updatedBy
    });
  }

  toJSON() {
    return {
      incidentId: this.incidentId,
      type: this.type,
      severity: this.severity,
      message: this.message,
      location: this.location,
      userId: this.userId,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      statusHistory: this.statusHistory,
      assignedTo: this.assignedTo,
      priority: this.priority
    };
  }
}

class SOSStorage {
  constructor() {
    this.incidents = new Map(); // In-memory storage
    this.dataFile = path.join(__dirname, 'data', 'sos-incidents.json');
    this.loadFromFile();
  }

  async loadFromFile() {
    try {
      // Ensure data directory exists
      await fs.mkdir(path.dirname(this.dataFile), { recursive: true });
      
      const data = await fs.readFile(this.dataFile, 'utf8');
      const incidents = JSON.parse(data);
      
      // Load incidents into memory
      incidents.forEach(incidentData => {
        const incident = new SOSIncident(incidentData);
        this.incidents.set(incident.incidentId, incident);
      });
      
      console.log(`Loaded ${this.incidents.size} SOS incidents from file`);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error('Error loading SOS incidents from file:', error);
      }
      // File doesn't exist or is invalid, start with empty storage
    }
  }

  async saveToFile() {
    try {
      const incidents = Array.from(this.incidents.values()).map(incident => incident.toJSON());
      await fs.writeFile(this.dataFile, JSON.stringify(incidents, null, 2));
    } catch (error) {
      console.error('Error saving SOS incidents to file:', error);
    }
  }

  async createIncident(incidentData) {
    // Check for existing incident with same ID (deduplication)
    if (this.incidents.has(incidentData.incidentId)) {
      return this.incidents.get(incidentData.incidentId);
    }

    const incident = new SOSIncident(incidentData);
    this.incidents.set(incident.incidentId, incident);
    
    // Persist to file
    await this.saveToFile();
    
    return incident;
  }

  getIncident(incidentId) {
    return this.incidents.get(incidentId);
  }

  getAllIncidents(filters = {}) {
    let incidents = Array.from(this.incidents.values());

    // Apply filters
    if (filters.userId) {
      incidents = incidents.filter(incident => incident.userId === filters.userId);
    }

    if (filters.status) {
      incidents = incidents.filter(incident => incident.status === filters.status);
    }

    if (filters.type) {
      incidents = incidents.filter(incident => incident.type === filters.type);
    }

    if (filters.severity) {
      incidents = incidents.filter(incident => incident.severity === filters.severity);
    }

    // Sort by createdAt in reverse chronological order (newest first)
    incidents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return incidents;
  }

  async updateIncident(incidentId, updates) {
    const incident = this.incidents.get(incidentId);
    if (!incident) {
      return null;
    }

    // Update allowed fields
    if (updates.status) {
      incident.updateStatus(updates.status, updates.updatedBy);
    }

    if (updates.assignedTo !== undefined) {
      incident.assignedTo = updates.assignedTo;
      incident.updatedAt = new Date().toISOString();
    }

    if (updates.message !== undefined) {
      incident.message = updates.message;
      incident.updatedAt = new Date().toISOString();
    }

    // Persist to file
    await this.saveToFile();

    return incident;
  }

  async deleteIncident(incidentId) {
    const deleted = this.incidents.delete(incidentId);
    if (deleted) {
      await this.saveToFile();
    }
    return deleted;
  }

  getStats() {
    const incidents = Array.from(this.incidents.values());
    return {
      total: incidents.length,
      byStatus: this.groupBy(incidents, 'status'),
      byType: this.groupBy(incidents, 'type'),
      bySeverity: this.groupBy(incidents, 'severity'),
      recent: incidents
        .filter(i => new Date(i.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000))
        .length
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
}

module.exports = {
  SOSIncident,
  SOSStorage,
  SOS_STATUSES,
  SOS_TYPES,
  SOS_SEVERITY,
  ALLOWED_STATUS_TRANSITIONS
};
