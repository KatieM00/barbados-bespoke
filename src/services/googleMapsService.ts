import { Loader } from '@googlemaps/js-api-loader';

// Barbados centre — fixed, never geocoded
const BARBADOS = { lat: 13.1939, lng: -59.5432 };
const BARBADOS_RADIUS = 50000;

let placesService: google.maps.places.PlacesService | null = null;
let loaderPromise: Promise<void> | null = null;

function getApiKey(): string {
  return import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '';
}

export async function initPlacesService(): Promise<void> {
  if (placesService) return;
  if (loaderPromise) return loaderPromise;

  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn('VITE_GOOGLE_MAPS_API_KEY is not set — Google Maps features disabled');
    return;
  }

  loaderPromise = new Loader({
    apiKey,
    version: 'weekly',
    libraries: ['places'],
  }).load().then(() => {
    // PlacesService requires a DOM element or Map instance
    const el = document.createElement('div');
    placesService = new google.maps.places.PlacesService(el);
  });

  return loaderPromise;
}

export interface PlaceResult {
  placeId: string;
  name: string;
  address: string;
  rating?: number;
  userRatingsTotal?: number;
  photos?: google.maps.places.PlacePhoto[];
  openingHours?: google.maps.places.PlaceOpeningHours;
  website?: string;
  geometry?: google.maps.places.PlaceGeometry;
}

export async function searchPlaces(
  query: string,
): Promise<PlaceResult[]> {
  await initPlacesService();
  if (!placesService) return [];

  return new Promise((resolve) => {
    const request: google.maps.places.TextSearchRequest = {
      query,
      location: new google.maps.LatLng(BARBADOS.lat, BARBADOS.lng),
      radius: BARBADOS_RADIUS,
    };

    placesService!.textSearch(request, (results, status) => {
      if (status !== google.maps.places.PlacesServiceStatus.OK || !results) {
        resolve([]);
        return;
      }

      resolve(
        results.slice(0, 5).map((r) => ({
          placeId: r.place_id ?? '',
          name: r.name ?? '',
          address: r.formatted_address ?? '',
          rating: r.rating,
          userRatingsTotal: r.user_ratings_total,
          photos: r.photos,
          geometry: r.geometry as google.maps.places.PlaceGeometry,
        }))
      );
    });
  });
}

export async function getPlaceDetails(placeId: string): Promise<PlaceResult | null> {
  await initPlacesService();
  if (!placesService) return null;

  return new Promise((resolve) => {
    const request: google.maps.places.PlaceDetailsRequest = {
      placeId,
      fields: [
        'place_id', 'name', 'formatted_address', 'rating',
        'user_ratings_total', 'photos', 'opening_hours',
        'website', 'geometry',
      ],
    };

    placesService!.getDetails(request, (result, status) => {
      if (status !== google.maps.places.PlacesServiceStatus.OK || !result) {
        resolve(null);
        return;
      }

      resolve({
        placeId: result.place_id ?? '',
        name: result.name ?? '',
        address: result.formatted_address ?? '',
        rating: result.rating,
        userRatingsTotal: result.user_ratings_total,
        photos: result.photos,
        openingHours: result.opening_hours,
        website: result.website,
        geometry: result.geometry as google.maps.places.PlaceGeometry,
      });
    });
  });
}

export function getPlacePhoto(
  photo: google.maps.places.PlacePhoto,
  maxWidth = 400,
): string {
  return photo.getUrl({ maxWidth });
}
