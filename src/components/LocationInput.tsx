import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Loader2, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { 
  getCurrentLocation, 
  geocodeAddress, 
  UserLocation, 
  GeolocationError,
  formatDistance,
  isLocationInValidRange
} from '@/utils/locationUtils';

interface LocationInputProps {
  onLocationChange: (location: UserLocation | null) => void;
  onLocationError: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

type LocationState = 'idle' | 'requesting' | 'success' | 'error' | 'geocoding';

const LocationInput: React.FC<LocationInputProps> = ({
  onLocationChange,
  onLocationError,
  disabled = false,
  className = ''
}) => {
  const [locationState, setLocationState] = useState<LocationState>('idle');
  const [currentLocation, setCurrentLocation] = useState<UserLocation | null>(null);
  const [address, setAddress] = useState('');
  const [showAddressInput, setShowAddressInput] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const { error, setError, clearError, withErrorHandling } = useErrorHandler(false);

  // Auto-request location on component mount
  useEffect(() => {
    if (!disabled) {
      handleGetLocation();
    }
  }, [disabled]);

  const handleGetLocation = async () => {
    setLocationState('requesting');
    clearError();

    try {
      const location = await getCurrentLocation();
      
      // Validate location is in reasonable range
      if (!isLocationInValidRange(location)) {
        const warningMessage = 'Location seems to be outside the Kumbh Yatra area. Please verify your location.';
        setError(warningMessage);
        onLocationError(warningMessage);
      }

      setCurrentLocation(location);
      setLocationState('success');
      onLocationChange(location);
      setRetryCount(0);
    } catch (err) {
      const error = err as any;
      setLocationState('error');
      setShowAddressInput(true);
      const errorMessage = error.message || 'Failed to get location';
      setError(errorMessage);
      onLocationError(errorMessage);
    }
  };

  const handleAddressSubmit = async () => {
    if (!address.trim()) {
      setError('Please enter a valid address');
      setLocationState('error');
      return;
    }

    setLocationState('geocoding');
    clearError();

    try {
      const location = await geocodeAddress(address);
      
      // Validate geocoded location
      if (!isLocationInValidRange(location)) {
        const warningMessage = 'Address seems to be outside the Kumbh Yatra area. Please verify the address.';
        setError(warningMessage);
        setLocationState('error');
        onLocationError(warningMessage);
        return;
      }

      setCurrentLocation(location);
      setLocationState('success');
      setShowAddressInput(false);
      onLocationChange(location);
      setRetryCount(0);
    } catch (err) {
      setLocationState('error');
      const errorMessage = err instanceof Error ? err.message : 'Failed to find location for this address';
      setError(errorMessage);
      onLocationError(errorMessage);
    }
  };

  const handleRetry = async () => {
    clearError();
    setLocationState('idle');
    setShowAddressInput(false);
    setRetryCount(prev => prev + 1);
    
    // Add delay for retries to avoid rapid successive calls
    if (retryCount > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    await handleGetLocation();
  };

  const handleManualAddress = () => {
    setShowAddressInput(true);
    clearError();
    setLocationState('idle');
  };

  const renderLocationStatus = () => {
    switch (locationState) {
      case 'requesting':
        return (
          <Alert>
            <LoadingSpinner size="sm" />
            <AlertDescription>
              Requesting your location... Please allow location access when prompted.
              {retryCount > 0 && <span className="block text-xs mt-1">Retry attempt {retryCount}</span>}
            </AlertDescription>
          </Alert>
        );

      case 'geocoding':
        return (
          <Alert>
            <LoadingSpinner size="sm" />
            <AlertDescription>
              Finding location for your address...
            </AlertDescription>
          </Alert>
        );

      case 'success':
        return (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Location confirmed: {currentLocation?.lat.toFixed(4)}, {currentLocation?.lng.toFixed(4)}
              {currentLocation && (
                <span className="block text-sm text-green-600 mt-1">
                  Distance from Kumbh center: {formatDistance(
                    Math.sqrt(
                      Math.pow(currentLocation.lat - 23.1815, 2) + 
                      Math.pow(currentLocation.lng - 75.7804, 2)
                    ) * 111 // Rough km conversion
                  )}
                </span>
              )}
            </AlertDescription>
          </Alert>
        );

      case 'error':
        return (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        );

      default:
        return null;
    }
  };

  return (
    <Card className={className}>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Your Location</Label>
          {locationState === 'success' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={disabled}
            >
              <MapPin className="h-3 w-3 mr-1" />
              Update
            </Button>
          )}
        </div>

        {renderLocationStatus()}

        {locationState === 'idle' && (
          <div className="space-y-3">
            <Button
              onClick={handleGetLocation}
              disabled={disabled}
              className="w-full"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Get My Location
            </Button>
            <Button
              variant="outline"
              onClick={handleManualAddress}
              disabled={disabled}
              className="w-full"
            >
              Enter Address Manually
            </Button>
          </div>
        )}

        {(locationState === 'error' || showAddressInput) && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm">
                Enter your address
              </Label>
              <Input
                id="address"
                type="text"
                placeholder="e.g., Near Mahakaleshwar Temple, Ujjain"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={disabled || locationState === 'geocoding'}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddressSubmit();
                  }
                }}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAddressSubmit}
                disabled={disabled || locationState === 'geocoding' || !address.trim()}
                className="flex-1"
              >
                {locationState === 'geocoding' ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <MapPin className="h-4 w-4 mr-2" />
                )}
                Find Location
              </Button>
              <Button
                variant="outline"
                onClick={handleRetry}
                disabled={disabled || locationState === 'geocoding'}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try GPS Again
              </Button>
            </div>
          </div>
        )}

        {currentLocation && (
          <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
            <strong>Coordinates:</strong> {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LocationInput;