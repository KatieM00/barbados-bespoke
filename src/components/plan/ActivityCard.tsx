import React, { useState } from 'react';
import {
  CheckCircle, Clock, ChevronDown, ChevronUp,
  Globe, UtensilsCrossed as MenuIcon, ExternalLink, Star,
  Waves, Fish, UtensilsCrossed, Wine, Landmark, Drama, Leaf, Music,
  Moon, ShoppingBag, Palette, Car, MapPin,
} from 'lucide-react';
import type { BarbadosActivity, TransferLeg } from '../../types';
import { bbdToGbp } from '../../types';
import { searchPlaces, getPlaceDetails, getPlacePhoto } from '../../services/googleMapsService';
import type { PlaceResult } from '../../services/googleMapsService';

// ── Category icon map — swap Lucide component for custom <img> when assets arrive ──
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  beach: Waves,
  'water-sports': Fish,
  food: UtensilsCrossed,
  rum: Wine,
  history: Landmark,
  culture: Drama,
  nature: Leaf,
  music: Music,
  nightlife: Moon,
  markets: ShoppingBag,
  crafts: Palette,
  transport: Car,
  general: MapPin,
};

// Food/drinks categories that may have a menu
const FOOD_CATEGORIES = new Set(['food', 'rum', 'nightlife']);

// Thin wrapper — replace with <img src={iconUrl} /> when custom icons are ready
const ActivityIcon: React.FC<{ category: string }> = ({ category }) => {
  const Icon = CATEGORY_ICONS[category] ?? MapPin;
  return <Icon size={18} style={{ color: '#4A9CB8' }} />;
};

interface ActivityCardProps {
  activity: BarbadosActivity;
  index: number;
  isCheckedIn?: boolean;
  onStreetView?: (activity: BarbadosActivity) => void;
  onCheckin?: (activity: BarbadosActivity) => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  index: _index,
  isCheckedIn = false,
  onStreetView: _onStreetView,
  onCheckin: _onCheckin,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [placeDetails, setPlaceDetails] = useState<PlaceResult | null>(null);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [placesLoaded, setPlacesLoaded] = useState(false);

  const gbp = bbdToGbp(activity.cost_bbd);

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    activity.google_maps_search_query || activity.address
  )}`;

  const websiteUrl = placeDetails?.website ?? activity.website ?? mapsUrl;
  const isFoodVenue = FOOD_CATEGORIES.has(activity.category);
  const menuUrl = activity.menu_url ?? null;

  const loadPlacesData = async () => {
    if (placesLoaded || placesLoading) return;
    setPlacesLoading(true);
    try {
      // Find the place using the activity's search query or address
      const query = activity.google_maps_search_query || activity.name + ' Barbados';
      const results = await searchPlaces(query);
      if (!results.length) return;

      const details = await getPlaceDetails(results[0].placeId);
      if (!details) return;

      setPlaceDetails(details);

      // Load up to 3 photos (getPlacePhoto is now async — fetch all in parallel)
      if (details.photos && details.photos.length > 0) {
        const urls = await Promise.all(
          details.photos.slice(0, 3).map((p) => getPlacePhoto(p, 400))
        );
        setPhotoUrls(urls.filter(Boolean));
      }
    } catch {
      // Fail silently — card still shows its content without Maps data
    } finally {
      setPlacesLoading(false);
      setPlacesLoaded(true);
    }
  };

  const handleToggle = () => {
    const next = !expanded;
    setExpanded(next);
    if (next && !placesLoaded) loadPlacesData();
  };

  // Get today's opening hours string if available
  // weekdayDescriptions is Mon–Sun (index 0 = Monday)
  const todayHours = placeDetails?.openingHours?.weekdayDescriptions
    ? (() => {
        const day = new Date().getDay(); // 0 = Sunday
        const idx = day === 0 ? 6 : day - 1;
        return placeDetails.openingHours!.weekdayDescriptions![idx] ?? null;
      })()
    : null;

  return (
    <div
      className={`bg-white rounded-xl border mx-1 overflow-hidden transition-all ${
        isCheckedIn ? 'border-green-300' : 'border-gray-100'
      }`}
    >
      {/* Main row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex-shrink-0">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: '#ddeef5' }}
          >
            <ActivityIcon category={activity.category} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-medium text-gray-900 text-sm leading-tight truncate">{activity.name}</h3>
            {isCheckedIn && <CheckCircle size={14} className="text-green-500 flex-shrink-0" />}
          </div>
          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
            <Clock size={11} />
            {activity.duration_minutes} min
          </p>
        </div>

        <div className="text-right flex-shrink-0">
          {activity.cost_bbd === 0 ? (
            <p className="text-sm font-semibold" style={{ color: '#4A9CB8' }}>Free</p>
          ) : (
            <>
              <p className="text-sm font-semibold text-gray-900">${activity.cost_bbd} BBD</p>
              {gbp > 0 && <p className="text-[11px] text-gray-400">~£{gbp}</p>}
            </>
          )}
        </div>
      </div>

      {/* Show Details toggle */}
      <div className="px-4 pb-2 flex justify-end">
        <button
          onClick={handleToggle}
          className="flex items-center gap-1 text-xs font-medium"
          style={{ color: '#4A9CB8' }}
        >
          {expanded ? 'Show Less' : 'Show Details'}
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-100">
          {/* Photo strip — shown when loaded */}
          {photoUrls.length > 0 && (
            <div
              className="flex gap-2 px-4 pt-3 pb-2 overflow-x-auto"
              style={{ scrollbarWidth: 'none' }}
            >
              {photoUrls.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`${activity.name} photo ${i + 1}`}
                  className="h-28 w-44 object-cover rounded-lg flex-shrink-0"
                />
              ))}
            </div>
          )}

          {/* Loading skeleton for photos */}
          {placesLoading && (
            <div className="flex gap-2 px-4 pt-3 pb-2 overflow-x-auto">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-28 w-44 rounded-lg flex-shrink-0 animate-pulse"
                  style={{ background: '#e8f0f4' }}
                />
              ))}
            </div>
          )}

          <div className="px-4 pb-4 pt-2 space-y-3">
            <p className="text-sm text-gray-600 leading-relaxed">{activity.description}</p>

            {/* Rating */}
            {placeDetails?.rating && (
              <div className="flex items-center gap-1.5">
                <Star size={13} className="text-amber-400 fill-amber-400" />
                <span className="text-xs font-semibold text-gray-700">{placeDetails.rating.toFixed(1)}</span>
                {placeDetails.userRatingsTotal && (
                  <span className="text-xs text-gray-400">({placeDetails.userRatingsTotal.toLocaleString()} reviews)</span>
                )}
              </div>
            )}

            {/* Today's hours */}
            {todayHours && (
              <p className="text-xs font-medium" style={{ color: '#1d3e49' }}>
                🕐 {todayHours}
              </p>
            )}

            <p className="text-xs text-gray-400">{activity.address}</p>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 pt-1">
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors active:bg-gray-50"
                style={{ borderColor: '#4A9CB8', color: '#4A9CB8' }}
              >
                <Globe size={13} />
                View Website
              </a>

              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors active:bg-gray-50"
                style={{ borderColor: '#4A9CB8', color: '#4A9CB8' }}
              >
                <ExternalLink size={13} />
                Open in Maps
              </a>

              {/* Menu — shown for food/drinks/nightlife categories only, when menu_url is available */}
              {isFoodVenue && menuUrl && (
                <a
                  href={menuUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors active:bg-gray-50"
                  style={{ borderColor: '#4A9CB8', color: '#4A9CB8' }}
                >
                  <MenuIcon size={13} />
                  Menu
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Transfer card (kept for export — not used in PlanPage directly)
interface TransferCardProps {
  transfer: TransferLeg;
}

export const TransferCard: React.FC<TransferCardProps> = ({ transfer }) => {
  const modeEmoji: Record<string, string> = {
    walking: '🚶', taxi: '🚕', minibus: '🚌', driving: '🚗',
  };
  return (
    <div className="flex items-center gap-3 px-4 py-3 mx-1">
      <div className="flex-shrink-0 text-xl">{modeEmoji[transfer.mode] || '🚕'}</div>
      <div className="flex-1">
        <p className="text-xs text-gray-500 leading-snug">{transfer.notes || `${transfer.mode} to next stop`}</p>
        <p className="text-xs text-gray-400">{transfer.duration_minutes} min · {transfer.cost_bbd === 0 ? 'Free' : `$${transfer.cost_bbd} BBD`}</p>
      </div>
      <div className="text-gray-300 text-xl">↓</div>
    </div>
  );
};

export default ActivityCard;
