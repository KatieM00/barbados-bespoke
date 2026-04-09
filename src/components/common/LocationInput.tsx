import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Locate } from 'lucide-react';

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
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchSuggestions = async (input: string) => {
    if (!input.trim() || input.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    try {
      const res = await fetch('/.netlify/functions/places-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input }),
      });
      if (!res.ok) return;
      const data = await res.json();
      const places: Array<{ formattedAddress?: string; displayName?: { text?: string } }> = data.places ?? [];
      const labels = places
        .map((p) => p.formattedAddress ?? p.displayName?.text ?? '')
        .filter(Boolean);
      setSuggestions(labels);
      setShowDropdown(labels.length > 0);
    } catch {
      // Fail silently — user can still type manually
    }
  };

  const handleChange = (v: string) => {
    onChange(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(v), 300);
  };

  const handleSelect = (suggestion: string) => {
    onChange(suggestion);
    setSuggestions([]);
    setShowDropdown(false);
  };

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
    <div className="w-full" ref={containerRef}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPin className="h-5 w-5 text-neutral-400" />
          </div>
          <input
            type="text"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
            placeholder={placeholder}
            className={`w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-white text-neutral-900 ${
              error ? 'border-red-300' : 'border-neutral-300'
            }`}
            style={{ fontSize: '16px' }}
            autoComplete="off"
          />
          {showDropdown && suggestions.length > 0 && (
            <ul
              className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg overflow-hidden"
              style={{ maxHeight: 220, overflowY: 'auto' }}
            >
              {suggestions.map((s, i) => (
                <li
                  key={i}
                  onMouseDown={() => handleSelect(s)}
                  className="px-4 py-3 text-sm text-neutral-800 cursor-pointer hover:bg-blue-50 border-b border-neutral-100 last:border-0"
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
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
