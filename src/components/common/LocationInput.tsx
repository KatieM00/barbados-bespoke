import React, { useState } from 'react';
import { MapPin, Locate } from 'lucide-react';

// DEMO MODE — restore for production:
// Re-add useEffect, useRef, loadGoogleMapsAPI, initializeAutocomplete,
// and the VITE_GOOGLE_MAPS_API_KEY script loader.

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}

const LocationInput: React.FC<LocationInputProps> = ({
  value,
  onChange,
  placeholder = 'Type a location...',
  error,
}) => {
  const [isLocating, setIsLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setLocateError('Geolocation not supported by this browser.');
      return;
    }
    setIsLocating(true);
    setLocateError(null);

    navigator.geolocation.getCurrentPosition(
      () => {
        setIsLocating(false);
        onChange('Current Location');
      },
      () => {
        setIsLocating(false);
        setLocateError('Could not get your location. Please type it instead.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  return (
    <div className="w-full">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPin className="h-5 w-5 text-neutral-400" />
          </div>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-white text-neutral-900 ${
              error ? 'border-red-300' : 'border-neutral-300'
            }`}
            style={{ fontSize: '16px' }}
          />
        </div>
        <button
          type="button"
          onClick={handleLocateMe}
          disabled={isLocating}
          className={`flex items-center justify-center w-12 h-12 rounded-lg border-2 transition-colors flex-shrink-0 ${
            isLocating
              ? 'bg-neutral-100 text-neutral-400 border-neutral-300 cursor-not-allowed'
              : 'bg-primary-600 text-white border-primary-600 hover:bg-primary-700 active:bg-primary-800'
          }`}
          title="Use my current location"
        >
          {isLocating ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
          ) : (
            <Locate className="h-5 w-5" />
          )}
        </button>
      </div>
      {(error || locateError) && (
        <p className="mt-1 text-xs text-red-600">{error || locateError}</p>
      )}
    </div>
  );
};

export default LocationInput;
