import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  allocateGate,
  canAllocateGate,
  previewAllocation,
  getAllocationAnalysis,
  validateAllocationRequest,
  batchAllocateGates,
  ALLOCATION_WEIGHTS
} from '../allocationUtils';
import { resetGateLoads, incrementGateLoad, getAllGates } from '../gateUtils';

// Mock the gate utils
vi.mock('../gateUtils', async () => {
  const actual = await vi.importActual('../gateUtils');
  return {
    ...actual,
    getAvailableGates: vi.fn(),
    incrementGateLoad: vi.fn()
  };
});

describe('allocationUtils', () => {
  const mockUserLocation = { lat: 23.176, lng: 75.785 };
  const mockPurpose = 'darshan';
  const mockTimeSlot = '8:00-10:00';

  beforeEach(() => {
    vi.clearAllMocks();
    resetGateLoads();
  });

  describe('ALLOCATION_WEIGHTS', () => {
    it('should have correct weight values', () => {
      expect(ALLOCATION_WEIGHTS.distance).toBe(0.6);
      expect(ALLOCATION_WEIGHTS.load).toBe(0.4);
      expect(ALLOCATION_WEIGHTS.distance + ALLOCATION_WEIGHTS.load).toBe(1.0);
    });
  });

  describe('validateAllocationRequest', () => {
    it('should validate correct request', () => {
      const request = {
        userLocation: mockUserLocation,
        purpose: mockPurpose,
        timeSlot: mockTimeSlot
      };

      const result = validateAllocationRequest(request);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject invalid latitude', () => {
      const request = {
        userLocation: { lat: 91, lng: 75.785 },
        purpose: mockPurpose,
        timeSlot: mockTimeSlot
      };

      const result = validateAllocationRequest(request);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid latitude');
    });

    it('should reject invalid longitude', () => {
      const request = {
        userLocation: { lat: 23.176, lng: 181 },
        purpose: mockPurpose,
        timeSlot: mockTimeSlot
      };

      const result = validateAllocationRequest(request);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid longitude');
    });

    it('should reject missing purpose', () => {
      const request = {
        userLocation: mockUserLocation,
        purpose: '',
        timeSlot: mockTimeSlot
      };

      const result = validateAllocationRequest(request);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Purpose is required');
    });

    it('should reject missing time slot', () => {
      const request = {
        userLocation: mockUserLocation,
        purpose: mockPurpose,
        timeSlot: ''
      };

      const result = validateAllocationRequest(request);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Time slot is required');
    });

    it('should reject invalid user location object', () => {
      const request = {
        userLocation: null as any,
        purpose: mockPurpose,
        timeSlot: mockTimeSlot
      };

      const result = validateAllocationRequest(request);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid user location');
    });
  });

  describe('canAllocateGate', () => {
    it('should return true when gates are available', () => {
      const { getAvailableGates } = require('../gateUtils');
      getAvailableGates.mockReturnValue([
        { name: 'Gate 1', lat: 23.176, lng: 75.785, currentLoad: 0, capacity: 100 }
      ]);

      const result = canAllocateGate(mockPurpose, mockTimeSlot);
      expect(result).toBe(true);
    });

    it('should return false when no gates are available', () => {
      const { getAvailableGates } = require('../gateUtils');
      getAvailableGates.mockReturnValue([]);

      const result = canAllocateGate(mockPurpose, mockTimeSlot);
      expect(result).toBe(false);
    });
  });

  describe('allocateGate', () => {
    it('should successfully allocate gate when available', () => {
      const mockGates = [
        { name: 'Gate 1', lat: 23.176, lng: 75.785, currentLoad: 0, capacity: 100 },
        { name: 'Gate 2', lat: 23.182, lng: 75.779, currentLoad: 50, capacity: 120 }
      ];

      const { getAvailableGates, incrementGateLoad } = require('../gateUtils');
      getAvailableGates.mockReturnValue(mockGates);
      incrementGateLoad.mockReturnValue(true);

      const result = allocateGate(mockUserLocation, mockPurpose, mockTimeSlot);

      expect(result.success).toBe(true);
      expect(result.gate).toBeDefined();
      expect(result.qrData).toBeDefined();
      expect(result.qrData?.purpose).toBe(mockPurpose);
      expect(result.qrData?.timeSlot).toBe(mockTimeSlot);
      expect(incrementGateLoad).toHaveBeenCalled();
    });

    it('should fail when no gates are available', () => {
      const { getAvailableGates } = require('../gateUtils');
      getAvailableGates.mockReturnValue([]);

      const result = allocateGate(mockUserLocation, mockPurpose, mockTimeSlot);

      expect(result.success).toBe(false);
      expect(result.error).toBe('All gates are full for this time slot/purpose. Please select another option.');
    });

    it('should fail when gate load increment fails', () => {
      const mockGates = [
        { name: 'Gate 1', lat: 23.176, lng: 75.785, currentLoad: 0, capacity: 100 }
      ];

      const { getAvailableGates, incrementGateLoad } = require('../gateUtils');
      getAvailableGates.mockReturnValue(mockGates);
      incrementGateLoad.mockReturnValue(false);

      const result = allocateGate(mockUserLocation, mockPurpose, mockTimeSlot);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to allocate gate. Please try again.');
    });

    it('should select gate with lowest score', () => {
      const mockGates = [
        { name: 'Gate 1', lat: 23.200, lng: 75.800, currentLoad: 80, capacity: 100 }, // Far + high load
        { name: 'Gate 2', lat: 23.177, lng: 75.786, currentLoad: 10, capacity: 120 }  // Near + low load
      ];

      const { getAvailableGates, incrementGateLoad } = require('../gateUtils');
      getAvailableGates.mockReturnValue(mockGates);
      incrementGateLoad.mockReturnValue(true);

      const result = allocateGate(mockUserLocation, mockPurpose, mockTimeSlot);

      expect(result.success).toBe(true);
      expect(result.gate?.name).toBe('Gate 2'); // Should select the closer, less loaded gate
    });
  });

  describe('previewAllocation', () => {
    it('should preview allocation without incrementing load', () => {
      const mockGates = [
        { name: 'Gate 1', lat: 23.176, lng: 75.785, currentLoad: 0, capacity: 100 }
      ];

      const { getAvailableGates, incrementGateLoad } = require('../gateUtils');
      getAvailableGates.mockReturnValue(mockGates);

      const result = previewAllocation(mockUserLocation, mockPurpose, mockTimeSlot);

      expect(result.success).toBe(true);
      expect(result.gate).toBeDefined();
      expect(incrementGateLoad).not.toHaveBeenCalled();
    });

    it('should fail preview when no gates available', () => {
      const { getAvailableGates } = require('../gateUtils');
      getAvailableGates.mockReturnValue([]);

      const result = previewAllocation(mockUserLocation, mockPurpose, mockTimeSlot);

      expect(result.success).toBe(false);
      expect(result.error).toBe('No gates available for preview');
    });
  });

  describe('getAllocationAnalysis', () => {
    it('should provide detailed analysis when gates available', () => {
      const mockGates = [
        { name: 'Gate 1', lat: 23.176, lng: 75.785, currentLoad: 0, capacity: 100 },
        { name: 'Gate 2', lat: 23.182, lng: 75.779, currentLoad: 50, capacity: 120 }
      ];

      const { getAvailableGates } = require('../gateUtils');
      getAvailableGates.mockReturnValue(mockGates);

      const analysis = getAllocationAnalysis(mockUserLocation, mockPurpose, mockTimeSlot);

      expect(analysis.availableGates).toBe(2);
      expect(analysis.gateScores).toHaveLength(2);
      expect(analysis.recommendation).toBeDefined();
      expect(analysis.gateScores[0]).toHaveProperty('score');
      expect(analysis.gateScores[0]).toHaveProperty('distance');
      expect(analysis.gateScores[0]).toHaveProperty('normalizedDistance');
      expect(analysis.gateScores[0]).toHaveProperty('normalizedLoad');
    });

    it('should handle no available gates', () => {
      const { getAvailableGates } = require('../gateUtils');
      getAvailableGates.mockReturnValue([]);

      const analysis = getAllocationAnalysis(mockUserLocation, mockPurpose, mockTimeSlot);

      expect(analysis.availableGates).toBe(0);
      expect(analysis.gateScores).toHaveLength(0);
      expect(analysis.recommendation).toBeNull();
    });
  });

  describe('batchAllocateGates', () => {
    it('should allocate gates for multiple requests', () => {
      const requests = [
        { userLocation: mockUserLocation, purpose: 'darshan', timeSlot: '8:00-10:00' },
        { userLocation: { lat: 23.180, lng: 75.788 }, purpose: 'aarti', timeSlot: '18:00-20:00' }
      ];

      const mockGates = [
        { name: 'Gate 1', lat: 23.176, lng: 75.785, currentLoad: 0, capacity: 100 },
        { name: 'Gate 2', lat: 23.182, lng: 75.779, currentLoad: 0, capacity: 120 }
      ];

      const { getAvailableGates, incrementGateLoad } = require('../gateUtils');
      getAvailableGates.mockReturnValue(mockGates);
      incrementGateLoad.mockReturnValue(true);

      const results = batchAllocateGates(requests);

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
    });

    it('should stop processing on first failure', () => {
      const requests = [
        { userLocation: mockUserLocation, purpose: 'darshan', timeSlot: '8:00-10:00' },
        { userLocation: { lat: 23.180, lng: 75.788 }, purpose: 'aarti', timeSlot: '18:00-20:00' }
      ];

      const { getAvailableGates } = require('../gateUtils');
      getAvailableGates.mockReturnValue([]); // No gates available

      const results = batchAllocateGates(requests);

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(false);
    });
  });
});