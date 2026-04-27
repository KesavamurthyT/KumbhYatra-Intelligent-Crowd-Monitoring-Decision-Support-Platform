import { Gate, getAvailableGates, incrementGateLoad } from './gateUtils';
import { UserLocation, calculateDistance } from './locationUtils';

export interface AllocationRequest {
  userLocation: UserLocation;
  purpose: string;
  timeSlot: string;
}

export interface AllocationResult {
  success: boolean;
  gate?: Gate;
  qrData?: {
    purpose: string;
    timeSlot: string;
    gate: string;
    timestamp: number;
    id: string;
  };
  error?: string;
  score?: number;
}

export interface GateScore {
  gate: Gate;
  distance: number;
  normalizedDistance: number;
  normalizedLoad: number;
  score: number;
}

// Heuristic weights - can be adjusted based on requirements
export const ALLOCATION_WEIGHTS = {
  distance: 0.6, // Prioritize proximity to user
  load: 0.4      // Balance load distribution
} as const;

/**
 * Normalize a value to 0-1 scale
 */
const normalize = (value: number, min: number, max: number): number => {
  if (max === min) return 0;
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
};

/**
 * Calculate heuristic score for gate allocation
 * Lower score = better choice
 */
const calculateGateScore = (
  gate: Gate,
  userLocation: UserLocation,
  allGates: Gate[]
): GateScore => {
  // Calculate distance from user to gate
  const distance = calculateDistance(userLocation, {
    lat: gate.lat,
    lng: gate.lng
  });

  // Get min/max values for normalization
  const distances = allGates.map(g => 
    calculateDistance(userLocation, { lat: g.lat, lng: g.lng })
  );
  const loads = allGates.map(g => g.currentLoad / g.capacity);

  const minDistance = Math.min(...distances);
  const maxDistance = Math.max(...distances);
  const minLoad = Math.min(...loads);
  const maxLoad = Math.max(...loads);

  // Normalize values to 0-1 scale
  const normalizedDistance = normalize(distance, minDistance, maxDistance);
  const normalizedLoad = normalize(gate.currentLoad / gate.capacity, minLoad, maxLoad);

  // Calculate composite score
  const score = 
    ALLOCATION_WEIGHTS.distance * normalizedDistance +
    ALLOCATION_WEIGHTS.load * normalizedLoad;

  return {
    gate,
    distance,
    normalizedDistance,
    normalizedLoad,
    score
  };
};

/**
 * Core gate allocation function using heuristic algorithm
 */
export const allocateGate = (
  userLocation: UserLocation,
  purpose: string,
  timeSlot: string
): AllocationResult => {
  try {
    // Get all available gates (currentLoad < capacity)
    const availableGates = getAvailableGates();

    if (availableGates.length === 0) {
      return {
        success: false,
        error: 'All gates are full for this time slot/purpose. Please select another option.'
      };
    }

    // Calculate scores for all available gates
    const gateScores = availableGates.map(gate => 
      calculateGateScore(gate, userLocation, availableGates)
    );

    // Sort by score (ascending - lower is better)
    gateScores.sort((a, b) => a.score - b.score);

    // Select the gate with the lowest score
    const selectedGateScore = gateScores[0];
    const selectedGate = selectedGateScore.gate;

    // Increment the gate's current load
    const loadIncremented = incrementGateLoad(selectedGate.name);
    
    if (!loadIncremented) {
      return {
        success: false,
        error: 'Failed to allocate gate. Please try again.'
      };
    }

    // Generate QR data
    const qrData = {
      purpose,
      timeSlot,
      gate: selectedGate.name,
      timestamp: Date.now(),
      id: generatePassId()
    };

    return {
      success: true,
      gate: selectedGate,
      qrData,
      score: selectedGateScore.score
    };

  } catch (error) {
    console.error('Gate allocation error:', error);
    return {
      success: false,
      error: 'An error occurred during gate allocation. Please try again.'
    };
  }
};

/**
 * Generate a unique pass ID
 */
const generatePassId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `KUMBH-${timestamp}-${random}`.toUpperCase();
};

/**
 * Check if allocation is possible for given parameters
 */
export const canAllocateGate = (
  purpose: string,
  timeSlot: string
): boolean => {
  const availableGates = getAvailableGates();
  return availableGates.length > 0;
};

/**
 * Get allocation preview without actually allocating
 */
export const previewAllocation = (
  userLocation: UserLocation,
  purpose: string,
  timeSlot: string
): AllocationResult => {
  try {
    const availableGates = getAvailableGates();

    if (availableGates.length === 0) {
      return {
        success: false,
        error: 'No gates available for preview'
      };
    }

    // Calculate scores without incrementing load
    const gateScores = availableGates.map(gate => 
      calculateGateScore(gate, userLocation, availableGates)
    );

    gateScores.sort((a, b) => a.score - b.score);
    const selectedGateScore = gateScores[0];

    return {
      success: true,
      gate: selectedGateScore.gate,
      score: selectedGateScore.score
    };

  } catch (error) {
    return {
      success: false,
      error: 'Preview failed'
    };
  }
};

/**
 * Get detailed allocation analysis for debugging/admin purposes
 */
export const getAllocationAnalysis = (
  userLocation: UserLocation,
  purpose: string,
  timeSlot: string
): {
  availableGates: number;
  gateScores: GateScore[];
  recommendation: Gate | null;
} => {
  const availableGates = getAvailableGates();
  
  if (availableGates.length === 0) {
    return {
      availableGates: 0,
      gateScores: [],
      recommendation: null
    };
  }

  const gateScores = availableGates.map(gate => 
    calculateGateScore(gate, userLocation, availableGates)
  );

  gateScores.sort((a, b) => a.score - b.score);

  return {
    availableGates: availableGates.length,
    gateScores,
    recommendation: gateScores[0]?.gate || null
  };
};

/**
 * Batch allocation for multiple users (useful for group bookings)
 */
export const batchAllocateGates = (
  requests: AllocationRequest[]
): AllocationResult[] => {
  const results: AllocationResult[] = [];

  for (const request of requests) {
    const result = allocateGate(
      request.userLocation,
      request.purpose,
      request.timeSlot
    );
    results.push(result);

    // If allocation fails, stop processing remaining requests
    if (!result.success) {
      break;
    }
  }

  return results;
};

/**
 * Validate allocation request
 */
export const validateAllocationRequest = (
  request: AllocationRequest
): { valid: boolean; error?: string } => {
  const { userLocation, purpose, timeSlot } = request;

  // Validate user location
  if (!userLocation || typeof userLocation.lat !== 'number' || typeof userLocation.lng !== 'number') {
    return { valid: false, error: 'Invalid user location' };
  }

  if (userLocation.lat < -90 || userLocation.lat > 90) {
    return { valid: false, error: 'Invalid latitude' };
  }

  if (userLocation.lng < -180 || userLocation.lng > 180) {
    return { valid: false, error: 'Invalid longitude' };
  }

  // Validate purpose
  if (!purpose || typeof purpose !== 'string' || purpose.trim().length === 0) {
    return { valid: false, error: 'Purpose is required' };
  }

  // Validate time slot
  if (!timeSlot || typeof timeSlot !== 'string' || timeSlot.trim().length === 0) {
    return { valid: false, error: 'Time slot is required' };
  }

  return { valid: true };
};