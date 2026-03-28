import React from 'react';
import { X, MapPin } from 'lucide-react';
import type { BarbadosActivity } from '../../types';

interface StreetViewModalProps {
  activity: BarbadosActivity | null;
  onClose: () => void;
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const StreetViewModal: React.FC<StreetViewModalProps> = ({ activity, onClose }) => {
  if (!activity) return null;

  // Prefer lat/lng for accuracy, fall back to address search
  const streetViewUrl = activity.lat && activity.lng
    ? `https://www.google.com/maps/embed/v1/streetview?key=${GOOGLE_MAPS_API_KEY}&location=${activity.lat},${activity.lng}&heading=0&pitch=0&fov=80`
    : `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(
        activity.google_maps_search_query || activity.address
      )}&maptype=satellite`;

  const mapsUrl = activity.lat && activity.lng
    ? `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${activity.lat},${activity.lng}`
    : `https://www.google.com/maps/search/${encodeURIComponent(activity.google_maps_search_query || activity.address)}`;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-black/90 text-white safe-area-pt">
        <button
          onClick={onClose}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{activity.name}</p>
          <p className="text-xs text-gray-400 truncate">{activity.address}</p>
        </div>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-primary-300 font-medium whitespace-nowrap"
        >
          <MapPin size={13} /> Open Maps
        </a>
      </div>

      {/* Street View iframe */}
      {GOOGLE_MAPS_API_KEY ? (
        <div className="flex-1 relative">
          <iframe
            title={`Street View: ${activity.name}`}
            src={streetViewUrl}
            className="w-full h-full border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full whitespace-nowrap">
            👆 This is the building/entrance you're looking for
          </div>
        </div>
      ) : (
        /* Fallback when no API key */
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center text-white">
          <MapPin size={40} className="text-primary-400" />
          <p className="font-semibold">Street View not configured</p>
          <p className="text-sm text-gray-400">
            Open Google Maps to preview this location.
          </p>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary-600 text-white font-medium px-6 py-3 rounded-xl"
          >
            Open in Google Maps
          </a>
        </div>
      )}
    </div>
  );
};

export default StreetViewModal;
