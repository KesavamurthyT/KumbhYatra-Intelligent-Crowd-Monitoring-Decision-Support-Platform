export interface UserLocation {
  lat: number;
  lng: number;
}

export interface GeolocationError {
  code: number;
  message: string;
}

export interface GeocodingResult {
  lat: number;
  lng: number;
  display_name: string;
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in kilometers
 */
export const calculateDistance = (
  point1: UserLocation,
  point2: UserLocation
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(point2.lat - point1.lat);
  const dLng = toRadians(point2.lng - point1.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.lat)) * Math.cos(toRadians(point2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

/**
 * Convert degrees to radians
 */
const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Get user's current location using HTML5 Geolocation API
 */
export const getCurrentLocation = (): Promise<UserLocation> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        code: 0,
        message: 'Geolocation is not supported by this browser'
      });
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 seconds
      maximumAge: 300000 // 5 minutes
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        let message = 'Unknown error occurred';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out';
            break;
        }

        reject({
          code: error.code,
          message
        });
      },
      options
    );
  });
};

/**
 * Geocode an address using OpenStreetMap Nominatim API
 */
export const geocodeAddress = async (address: string): Promise<UserLocation> => {
  if (!address.trim()) {
    throw new Error('Address cannot be empty');
  }

  const encodedAddress = encodeURIComponent(address.trim());
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&addressdetails=1`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'KumbhYatra/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Geocoding request failed: ${response.status}`);
    }

    const data: GeocodingResult[] = await response.json();

    if (!data || data.length === 0) {
      throw new Error('No results found for the provided address');
    }

    const result = data[0];
    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lng)
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Geocoding failed: ${error.message}`);
    }
    throw new Error('Geocoding failed: Unknown error');
  }
};

/**
 * Get user location with fallback to address geocoding
 */
export const getUserLocation = async (fallbackAddress?: string): Promise<UserLocation> => {
  try {
    // Try geolocation first
    return await getCurrentLocation();
  } catch (geolocationError) {
    console.warn('Geolocation failed:', geolocationError);
    
    // If fallback address is provided, try geocoding
    if (fallbackAddress) {
      try {
        return await geocodeAddress(fallbackAddress);
      } catch (geocodingError) {
        console.error('Geocoding failed:', geocodingError);
        throw new Error('Unable to determine location. Please check your address and try again.');
      }
    }
    
    // No fallback available
    throw new Error('Location access denied. Please enter your address manually.');
  }
};

/**
 * Validate coordinates
 */
export const isValidCoordinates = (location: UserLocation): boolean => {
  const { lat, lng } = location;
  
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180 &&
    !isNaN(lat) && !isNaN(lng)
  );
};

/**
 * Format distance for display
 */
export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }
  return `${distanceKm.toFixed(1)}km`;
};

/**
 * Check if location is within a reasonable range of Kumbh Yatra area
 * This helps validate that the location makes sense for the event
 */
export const isLocationInValidRange = (location: UserLocation): boolean => {
  // Approximate center of Ujjain (Kumbh Yatra location)
  const kumbhCenter: UserLocation = { lat: 23.1815, lng: 75.7804 };
  const maxDistanceKm = 100; // 100km radius seems reasonable
  
  const distance = calculateDistance(location, kumbhCenter);
  return distance <= maxDistanceKm;
};

/**
 * Get location with validation
 */
export const getValidatedUserLocation = async (fallbackAddress?: string): Promise<UserLocation> => {
  const location = await getUserLocation(fallbackAddress);
  
  if (!isValidCoordinates(location)) {
    throw new Error('Invalid coordinates received');
  }
  
  if (!isLocationInValidRange(location)) {
    console.warn('Location is outside expected range, but proceeding anyway');
  }
  
  return location;
};