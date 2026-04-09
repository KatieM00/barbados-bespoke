// All Google Places API (New) calls are proxied through Netlify functions.
// No API key is ever exposed to the frontend.

export interface PlacePhoto {
  name: string; // e.g. "places/PLACE_ID/photos/PHOTO_ID"
}

export interface PlaceOpeningHours {
  weekdayDescriptions?: string[]; // Places API (New) field name
}

export interface PlaceResult {
  placeId: string;
  name: string;
  address: string;
  rating?: number;
  userRatingsTotal?: number;
  photos?: PlacePhoto[];
  openingHours?: PlaceOpeningHours;
  website?: string;
}

// ─── Search ───────────────────────────────────────────────────────────────────

export async function searchPlaces(query: string): Promise<PlaceResult[]> {
  try {
    const res = await fetch('/.netlify/functions/places-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const places: unknown[] = data.places ?? [];
    return places.map(mapPlace);
  } catch {
    return [];
  }
}

// ─── Details ─────────────────────────────────────────────────────────────────

export async function getPlaceDetails(placeId: string): Promise<PlaceResult | null> {
  try {
    const res = await fetch('/.netlify/functions/places-details', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ placeId }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.place) return null;
    return mapPlace(data.place);
  } catch {
    return null;
  }
}

// ─── Photo ────────────────────────────────────────────────────────────────────

export async function getPlacePhoto(photo: PlacePhoto, maxWidth = 400): Promise<string> {
  try {
    const res = await fetch('/.netlify/functions/places-photo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoName: photo.name, maxWidth }),
    });
    if (!res.ok) return '';
    const data = await res.json();
    return data.photoUrl ?? '';
  } catch {
    return '';
  }
}

// ─── Mapper ───────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPlace(p: any): PlaceResult {
  return {
    placeId: p.id ?? '',
    name: p.displayName?.text ?? p.name ?? '',
    address: p.formattedAddress ?? '',
    rating: p.rating,
    userRatingsTotal: p.userRatingCount,
    photos: Array.isArray(p.photos)
      ? p.photos.map((ph: { name: string }) => ({ name: ph.name }))
      : undefined,
    openingHours: p.regularOpeningHours
      ? { weekdayDescriptions: p.regularOpeningHours.weekdayDescriptions }
      : undefined,
    website: p.websiteUri,
  };
}
