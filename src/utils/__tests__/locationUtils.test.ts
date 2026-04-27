import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  calculateDistance,
  isValidCoordinates,
  formatDistance,
  isLocationInValidRange,
  getCurrentLocation,
  geocodeAddress
} from '../locationUtils';

// Mock fetch for geocoding tests
global.fetch = vi.fn();

describe('locationUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateDistance', () => {
    it('should calculate distance between two points correctly', () => {
      const point1 = { lat: 23.176, lng: 75.785 };
      const point2 = { lat: 23.182, lng: 75.779 };
      
      const distance = calculateDistance(point1, point2);
      
      // Distance should be approximately 0.8 km
      expect(distance).toBeGreaterThan(0.7);
      expect(distance).toBeLessThan(0.9);
    });

    it('should return 0 for identical points', () => {
      const point = { lat: 23.176, lng: 75.785 };
      const distance = calculateDistance(point, point);
      expect(distance).toBe(0);
    });

    it('should handle negative coordinates', () => {
      const point1 = { lat: -23.176, lng: -75.785 };
      const point2 = { lat: -23.182, lng: -75.779 };
      
      const distance = calculateDistance(point1, point2);
      expect(distance).toBeGreaterThan(0);
    });
  });

  describe('isValidCoordinates', () => {
    it('should return true for valid coordinates', () => {
      const validLocation = { lat: 23.176, lng: 75.785 };
      expect(isValidCoordinates(validLocation)).toBe(true);
    });

    it('should return false for invalid latitude', () => {
      const invalidLat = { lat: 91, lng: 75.785 };
      expect(isValidCoordinates(invalidLat)).toBe(false);
      
      const invalidLat2 = { lat: -91, lng: 75.785 };
      expect(isValidCoordinates(invalidLat2)).toBe(false);
    });

    it('should return false for invalid longitude', () => {
      const invalidLng = { lat: 23.176, lng: 181 };
      expect(isValidCoordinates(invalidLng)).toBe(false);
      
      const invalidLng2 = { lat: 23.176, lng: -181 };
      expect(isValidCoordinates(invalidLng2)).toBe(false);
    });

    it('should return false for NaN values', () => {
      const nanLocation = { lat: NaN, lng: 75.785 };
      expect(isValidCoordinates(nanLocation)).toBe(false);
    });

    it('should return false for non-number values', () => {
      const invalidLocation = { lat: '23.176' as any, lng: 75.785 };
      expect(isValidCoordinates(invalidLocation)).toBe(false);
    });
  });

  describe('formatDistance', () => {
    it('should format distance in meters for values < 1km', () => {
      expect(formatDistance(0.5)).toBe('500m');
      expect(formatDistance(0.123)).toBe('123m');
    });

    it('should format distance in kilometers for values >= 1km', () => {
      expect(formatDistance(1.5)).toBe('1.5km');
      expect(formatDistance(10.234)).toBe('10.2km');
    });

    it('should handle edge case of exactly 1km', () => {
      expect(formatDistance(1.0)).toBe('1.0km');
    });
  });

  describe('isLocationInValidRange', () => {
    it('should return true for locations within Kumbh Yatra area', () => {
      const nearbyLocation = { lat: 23.180, lng: 75.780 };
      expect(isLocationInValidRange(nearbyLocation)).toBe(true);
    });

    it('should return false for locations far from Kumbh Yatra area', () => {
      const farLocation = { lat: 28.6139, lng: 77.2090 }; // Delhi
      expect(isLocationInValidRange(farLocation)).toBe(false);
    });

    it('should return true for locations at the edge of valid range', () => {
      // Test a location approximately 100km away
      const edgeLocation = { lat: 24.0815, lng: 75.7804 };
      expect(isLocationInValidRange(edgeLocation)).toBe(true);
    });
  });

  describe('getCurrentLocation', () => {
    beforeEach(() => {
      // Mock navigator.geolocation
      Object.defineProperty(global.navigator, 'geolocation', {
        value: {
          getCurrentPosition: vi.fn()
        },
        configurable: true
      });
    });

    it('should resolve with location when geolocation succeeds', async () => {
      const mockPosition = {
        coords: {
          latitude: 23.176,
          longitude: 75.785
        }
      };

      (navigator.geolocation.getCurrentPosition as any).mockImplementation(
        (success: any) => success(mockPosition)
      );

      const location = await getCurrentLocation();
      expect(location).toEqual({ lat: 23.176, lng: 75.785 });
    });

    it('should reject when geolocation is not supported', async () => {
      Object.defineProperty(global.navigator, 'geolocation', {
        value: undefined,
        configurable: true
      });

      await expect(getCurrentLocation()).rejects.toMatchObject({
        code: 0,
        message: 'Geolocation is not supported by this browser'
      });
    });

    it('should reject with appropriate error for permission denied', async () => {
      const mockError = { code: 1, message: 'Permission denied' };

      (navigator.geolocation.getCurrentPosition as any).mockImplementation(
        (success: any, error: any) => error(mockError)
      );

      await expect(getCurrentLocation()).rejects.toMatchObject({
        code: 1,
        message: 'Location access denied by user'
      });
    });
  });

  describe('geocodeAddress', () => {
    it('should return coordinates for valid address', async () => {
      const mockResponse = [
        {
          lat: '23.176',
          lng: '75.785',
          display_name: 'Ujjain, Madhya Pradesh, India'
        }
      ];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const location = await geocodeAddress('Ujjain');
      expect(location).toEqual({ lat: 23.176, lng: 75.785 });
    });

    it('should throw error for empty address', async () => {
      await expect(geocodeAddress('')).rejects.toThrow('Address cannot be empty');
      await expect(geocodeAddress('   ')).rejects.toThrow('Address cannot be empty');
    });

    it('should throw error when no results found', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      });

      await expect(geocodeAddress('Invalid Address')).rejects.toThrow(
        'No results found for the provided address'
      );
    });

    it('should throw error when API request fails', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      await expect(geocodeAddress('Some Address')).rejects.toThrow(
        'Geocoding request failed: 500'
      );
    });

    it('should throw error when network request fails', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(geocodeAddress('Some Address')).rejects.toThrow(
        'Geocoding failed: Network error'
      );
    });
  });
});