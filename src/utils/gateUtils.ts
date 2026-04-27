import gatesData from '@/data/gates.json';

export interface Gate {
  name: string;
  lat: number;
  lng: number;
  currentLoad: number;
  capacity: number;
}

export interface GateAvailability {
  gate: Gate;
  available: boolean;
  availableSlots: number;
}

// In-memory gate state management
let gates: Gate[] = [...gatesData];

/**
 * Get all gates with their current status
 */
export const getAllGates = (): Gate[] => {
  return [...gates];
};

/**
 * Get gates that have available capacity
 */
export const getAvailableGates = (): Gate[] => {
  return gates.filter(gate => gate.currentLoad < gate.capacity);
};

/**
 * Check if a specific gate has available capacity
 */
export const isGateAvailable = (gateName: string): boolean => {
  const gate = gates.find(g => g.name === gateName);
  return gate ? gate.currentLoad < gate.capacity : false;
};

/**
 * Get availability status for all gates
 */
export const getGateAvailability = (): GateAvailability[] => {
  return gates.map(gate => ({
    gate,
    available: gate.currentLoad < gate.capacity,
    availableSlots: Math.max(0, gate.capacity - gate.currentLoad)
  }));
};

/**
 * Check if any gates have availability for a given purpose and time slot
 * This is a simplified check - in a real system, you might have more complex
 * business logic for different purposes and time slots
 */
export const hasAvailabilityForSlot = (purpose: string, timeSlot: string): boolean => {
  return getAvailableGates().length > 0;
};

/**
 * Increment the load for a specific gate
 */
export const incrementGateLoad = (gateName: string): boolean => {
  const gateIndex = gates.findIndex(g => g.name === gateName);
  if (gateIndex === -1) {
    console.error(`Gate ${gateName} not found`);
    return false;
  }

  const gate = gates[gateIndex];
  if (gate.currentLoad >= gate.capacity) {
    console.error(`Gate ${gateName} is at full capacity`);
    return false;
  }

  gates[gateIndex] = {
    ...gate,
    currentLoad: gate.currentLoad + 1
  };

  return true;
};

/**
 * Decrement the load for a specific gate (useful for cancellations)
 */
export const decrementGateLoad = (gateName: string): boolean => {
  const gateIndex = gates.findIndex(g => g.name === gateName);
  if (gateIndex === -1) {
    console.error(`Gate ${gateName} not found`);
    return false;
  }

  const gate = gates[gateIndex];
  if (gate.currentLoad <= 0) {
    console.error(`Gate ${gateName} load is already at minimum`);
    return false;
  }

  gates[gateIndex] = {
    ...gate,
    currentLoad: gate.currentLoad - 1
  };

  return true;
};

/**
 * Reset all gate loads (useful for testing or daily resets)
 */
export const resetGateLoads = (): void => {
  gates = gates.map(gate => ({
    ...gate,
    currentLoad: 0
  }));
};

/**
 * Get gate by name
 */
export const getGateByName = (gateName: string): Gate | undefined => {
  return gates.find(g => g.name === gateName);
};

/**
 * Get total capacity across all gates
 */
export const getTotalCapacity = (): number => {
  return gates.reduce((total, gate) => total + gate.capacity, 0);
};

/**
 * Get total current load across all gates
 */
export const getTotalLoad = (): number => {
  return gates.reduce((total, gate) => total + gate.currentLoad, 0);
};

/**
 * Get overall system utilization percentage
 */
export const getSystemUtilization = (): number => {
  const totalCapacity = getTotalCapacity();
  const totalLoad = getTotalLoad();
  return totalCapacity > 0 ? (totalLoad / totalCapacity) * 100 : 0;
};