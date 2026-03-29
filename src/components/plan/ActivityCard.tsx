import React, { useState } from 'react';
import {
  CheckCircle, Clock, ChevronDown, ChevronUp,
  Globe, UtensilsCrossed as MenuIcon,
  Waves, Fish, UtensilsCrossed, Wine, Landmark, Drama, Leaf, Music,
  Moon, ShoppingBag, Palette, Car, MapPin,
} from 'lucide-react';
import type { BarbadosActivity, TransferLeg } from '../../types';
import { bbdToGbp } from '../../types';

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
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  index,
  isCheckedIn = false,
}) => {
  const [expanded, setExpanded] = useState(false);
  const gbp = bbdToGbp(activity.cost_bbd);

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    activity.google_maps_search_query || activity.address
  )}`;

  // Website button: use activity.website if available, otherwise fall back to Google Maps location
  // TODO: populate activity.website from Google Places API (place details call using activity.place_id)
  const websiteUrl = activity.website ?? mapsUrl;

  // Menu button: shown only for food/drinks categories
  // TODO: populate activity.menu_url from Google Places API or manual curation data
  const isFoodVenue = FOOD_CATEGORIES.has(activity.category);
  const menuUrl = activity.menu_url ?? null;

  return (
    <div
      className={`bg-white rounded-xl border mx-1 overflow-hidden transition-all ${
        isCheckedIn ? 'border-green-300' : 'border-gray-100'
      }`}
    >
      {/* Main row */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Icon circle */}
        <div className="flex-shrink-0">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: '#ddeef5' }}
          >
            <ActivityIcon category={activity.category} />
          </div>
        </div>

        {/* Name + time */}
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

        {/* Cost — local (BBD) big, home (GBP) small */}
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

      {/* Show Details toggle — right-aligned for right-handed reach */}
      <div className="px-4 pb-2 flex justify-end">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs font-medium"
          style={{ color: '#4A9CB8' }}
        >
          {expanded ? 'Show Less' : 'Show Details'}
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100 space-y-3">
          <p className="text-sm text-gray-600 leading-relaxed">{activity.description}</p>

          <p className="text-xs text-gray-400">{activity.address}</p>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            {/* View Website — always shown, always labelled "View Website"
                Logic: uses activity.website (from Google Places API) if available,
                otherwise falls back to Google Maps search URL for this location.
                TODO: populate activity.website from Places API place details response (field: website) */}
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

            {/* Menu — shown for food/drinks/nightlife categories only, when menu_url is available
                TODO: populate activity.menu_url from Google Places API or manual curation */}
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
