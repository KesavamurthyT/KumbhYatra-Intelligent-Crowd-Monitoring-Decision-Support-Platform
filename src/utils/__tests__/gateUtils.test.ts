import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAllGates,
  getAvailableGates,
  isGateAvailable,
  incrementGateLoad,
  decrementGateLoad,
  resetGateLoads,
  getGateByName,
  getTotalCapacity,
  getTotalLoad,
  getSystemUtilization,
  hasAvailabilityForSlot
} from '../gateUtils';

describe('gateUtils', () => {
  beforeEach(() => {
    // Reset gate loads before each test
    resetGateLoads();
  });

  describe('getAllGates', () => {
    it('should return all gates', () => {
      const gates = getAllGates();
      expect(gates).toHaveLength(6);
      expect(gates[0]).toHaveProperty('name');
      expect(gates[0]).toHaveProperty('lat');
      expect(gates[0]).toHaveProperty('lng');
      expect(gates[0]).toHaveProperty('currentLoad');
      expect(gates[0]).toHaveProperty('capacity');
    });
  });

  describe('getAvailableGates', () => {
    it('should return all gates when none are at capacity', () => {
      const availableGates = getAvailableGates();
      expect(availableGates).toHaveLength(6);
    });

    it('should exclude gates at capacity', () => {
      // Fill Gate 1 to capacity
      const gate1 = getGateByName('Gate 1');
      if (gate1) {
        for (let i = 0; i < gate1.capacity; i++) {
          incrementGateLoad('Gate 1');
        }
      }

      const availableGates = getAvailableGates();
      expect(availableGates).toHaveLength(5);
      expect(availableGates.find(g => g.name === 'Gate 1')).toBeUndefined();
    });
  });

  describe('isGateAvailable', () => {
    it('should return true for available gate', () => {
      expect(isGateAvailable('Gate 1')).toBe(true);
    });

    it('should return false for gate at capacity', () => {
      const gate1 = getGateByName('Gate 1');
      if (gate1) {
        for (let i = 0; i < gate1.capacity; i++) {
          incrementGateLoad('Gate 1');
        }
      }
      expect(isGateAvailable('Gate 1')).toBe(false);
    });

    it('should return false for non-existent gate', () => {
      expect(isGateAvailable('Non-existent Gate')).toBe(false);
    });
  });

  describe('incrementGateLoad', () => {
    it('should increment gate load successfully', () => {
      const result = incrementGateLoad('Gate 1');
      expect(result).toBe(true);
      
      const gate = getGateByName('Gate 1');
      expect(gate?.currentLoad).toBe(1);
    });

    it('should fail to increment when gate is at capacity', () => {
      const gate1 = getGateByName('Gate 1');
      if (gate1) {
        // Fill to capacity
        for (let i = 0; i < gate1.capacity; i++) {
          incrementGateLoad('Gate 1');
        }
        
        // Try to increment beyond capacity
        const result = incrementGateLoad('Gate 1');
        expect(result).toBe(false);
      }
    });

    it('should fail for non-existent gate', () => {
      const result = incrementGateLoad('Non-existent Gate');
      expect(result).toBe(false);
    });
  });

  describe('decrementGateLoad', () => {
    it('should decrement gate load successfully', () => {
      incrementGateLoad('Gate 1');
      const result = decrementGateLoad('Gate 1');
      expect(result).toBe(true);
      
      const gate = getGateByName('Gate 1');
      expect(gate?.currentLoad).toBe(0);
    });

    it('should fail to decrement when load is already 0', () => {
      const result = decrementGateLoad('Gate 1');
      expect(result).toBe(false);
    });

    it('should fail for non-existent gate', () => {
      const result = decrementGateLoad('Non-existent Gate');
      expect(result).toBe(false);
    });
  });

  describe('getGateByName', () => {
    it('should return gate by name', () => {
      const gate = getGateByName('Gate 1');
      expect(gate).toBeDefined();
      expect(gate?.name).toBe('Gate 1');
    });

    it('should return undefined for non-existent gate', () => {
      const gate = getGateByName('Non-existent Gate');
      expect(gate).toBeUndefined();
    });
  });

  describe('getTotalCapacity', () => {
    it('should return correct total capacity', () => {
      const totalCapacity = getTotalCapacity();
      // Sum of all gate capacities: 100 + 120 + 80 + 90 + 70 + 110 = 570
      expect(totalCapacity).toBe(570);
    });
  });

  describe('getTotalLoad', () => {
    it('should return 0 when no gates have load', () => {
      const totalLoad = getTotalLoad();
      expect(totalLoad).toBe(0);
    });

    it('should return correct total load', () => {
      incrementGateLoad('Gate 1'); // +1
      incrementGateLoad('Gate 2'); // +1
      incrementGateLoad('Gate 2'); // +1
      
      const totalLoad = getTotalLoad();
      expect(totalLoad).toBe(3);
    });
  });

  describe('getSystemUtilization', () => {
    it('should return 0% when no gates have load', () => {
      const utilization = getSystemUtilization();
      expect(utilization).toBe(0);
    });

    it('should calculate correct utilization percentage', () => {
      // Add some load
      incrementGateLoad('Gate 1'); // 1/570 total capacity
      
      const utilization = getSystemUtilization();
      expect(utilization).toBeCloseTo(0.175, 2); // 1/570 * 100
    });
  });

  describe('hasAvailabilityForSlot', () => {
    it('should return true when gates are available', () => {
      const hasAvailability = hasAvailabilityForSlot('darshan', '8:00-10:00');
      expect(hasAvailability).toBe(true);
    });

    it('should return false when no gates are available', () => {
      // Fill all gates to capacity
      const gates = getAllGates();
      gates.forEach(gate => {
        for (let i = 0; i < gate.capacity; i++) {
          incrementGateLoad(gate.name);
        }
      });

      const hasAvailability = hasAvailabilityForSlot('darshan', '8:00-10:00');
      expect(hasAvailability).toBe(false);
    });
  });

  describe('resetGateLoads', () => {
    it('should reset all gate loads to 0', () => {
      // Add some load
      incrementGateLoad('Gate 1');
      incrementGateLoad('Gate 2');
      
      resetGateLoads();
      
      const totalLoad = getTotalLoad();
      expect(totalLoad).toBe(0);
    });
  });
});