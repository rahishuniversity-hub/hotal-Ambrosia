// ═════════════════════════════════════════════════════════════════════
// Hotel Ambrosia — Delivery Radius & Distance Calculation Engine
// Coordinates: 22.5434° N, 72.9529° E (Anand Sojitra Road, Anand)
// Delivery Rule: Orders accepted only within ≤ 10 KM radius
// ═════════════════════════════════════════════════════════════════════

export const HOTEL_LOCATION = {
  name: "Hotel Ambrosia",
  address: "Opp. Uma Bhavan, Nr. Municipal Water Tank, Anand Sojitra Road, Borsad Char Rasta, Anand – 388 001",
  lat: 22.5434,
  lng: 72.9529,
  maxDeliveryRadiusKm: 10.0,
};

export interface LandmarkPreset {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distanceKm: number;
  isWithinRadius: boolean;
  notes?: string;
}

export const ANAND_LANDMARKS: LandmarkPreset[] = [
  {
    id: "borsad-char-rasta",
    name: "Borsad Char Rasta (Immediate Area)",
    lat: 22.5438,
    lng: 72.9535,
    distanceKm: 0.3,
    isWithinRadius: true,
  },
  {
    id: "anand-railway-station",
    name: "Anand Railway Station / Station Road",
    lat: 22.5562,
    lng: 72.9615,
    distanceKm: 1.8,
    isWithinRadius: true,
  },
  {
    id: "amul-dairy-campus",
    name: "Amul Dairy Campus & Amul Chocolate Plant",
    lat: 22.5531,
    lng: 72.9501,
    distanceKm: 2.1,
    isWithinRadius: true,
  },
  {
    id: "town-hall-supermarket",
    name: "Anand Town Hall & Super Market",
    lat: 22.5598,
    lng: 72.9467,
    distanceKm: 2.5,
    isWithinRadius: true,
  },
  {
    id: "vallabh-vidyanagar",
    name: "Vallabh Vidyanagar (Nana & Mota Bazaar / SP University)",
    lat: 22.5528,
    lng: 72.9242,
    distanceKm: 3.8,
    isWithinRadius: true,
  },
  {
    id: "jitodia",
    name: "Jitodia Village / Wai Wai Road",
    lat: 22.5695,
    lng: 72.9734,
    distanceKm: 4.2,
    isWithinRadius: true,
  },
  {
    id: "karamsad",
    name: "Karamsad (Pramukh Swami Hospital / Bhaikaka Statue)",
    lat: 22.5471,
    lng: 72.8998,
    distanceKm: 5.4,
    isWithinRadius: true,
  },
  {
    id: "bakrol",
    name: "Bakrol / Vadtal-Bakrol Road",
    lat: 22.5712,
    lng: 72.9095,
    distanceKm: 6.1,
    isWithinRadius: true,
  },
  {
    id: "mogar-expressway",
    name: "Mogar (NH 48 Expressway Crossing)",
    lat: 22.4932,
    lng: 72.9745,
    distanceKm: 7.6,
    isWithinRadius: true,
  },
  {
    id: "chikhodra-crossroads",
    name: "Chikhodra Crossroads",
    lat: 22.5921,
    lng: 72.9812,
    distanceKm: 8.4,
    isWithinRadius: true,
  },
  {
    id: "vasad-approach",
    name: "Vasad Approach (Near Mahi River bridge)",
    lat: 22.4632,
    lng: 72.9876,
    distanceKm: 9.7,
    isWithinRadius: true,
  },
  // Outside delivery radius (for rejection testing)
  {
    id: "petlad",
    name: "Petlad Town Center (>10 KM - Rejected)",
    lat: 22.4745,
    lng: 72.8021,
    distanceKm: 15.6,
    isWithinRadius: false,
    notes: "Outside 10 km delivery radius",
  },
  {
    id: "nadiad-city",
    name: "Nadiad City Center (>10 KM - Rejected)",
    lat: 22.6916,
    lng: 72.8634,
    distanceKm: 19.8,
    isWithinRadius: false,
    notes: "Outside 10 km delivery radius",
  },
  {
    id: "umreth",
    name: "Umreth Town (>10 KM - Rejected)",
    lat: 22.6989,
    lng: 73.1156,
    distanceKm: 24.2,
    isWithinRadius: false,
    notes: "Outside 10 km delivery radius",
  },
];

/**
 * Computes Haversine distance in kilometers between two geo-coordinates
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10;
}

export interface DeliveryCheckResult {
  isEligible: boolean;
  distanceKm: number;
  message: string;
  zoneStatus: "approved" | "rejected" | "unknown";
}

/**
 * Validates whether a given distance in km is eligible for delivery (≤ 10 km)
 */
export function evaluateDeliveryDistance(distanceKm: number): DeliveryCheckResult {
  if (distanceKm <= 0) {
    return {
      isEligible: false,
      distanceKm: 0,
      message: "Please specify or detect your delivery location.",
      zoneStatus: "unknown",
    };
  }

  if (distanceKm <= HOTEL_LOCATION.maxDeliveryRadiusKm) {
    return {
      isEligible: true,
      distanceKm,
      message: `Delivery available! Your location is ~${distanceKm} km from Hotel Ambrosia (Within 10 km zone).`,
      zoneStatus: "approved",
    };
  }

  return {
    isEligible: false,
    distanceKm,
    message: `Delivery unavailable. Your location is ~${distanceKm} km away, which exceeds our maximum delivery radius of 10 km from Hotel Ambrosia, Anand. Please select Takeaway (Pickup) or Dine-In instead.`,
    zoneStatus: "rejected",
  };
}

/**
 * Browser GPS detection helper
 */
export function detectCurrentLocation(): Promise<{
  lat: number;
  lng: number;
  distanceKm: number;
  checkResult: DeliveryCheckResult;
}> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const distanceKm = calculateHaversineDistanceKm(
          HOTEL_LOCATION.lat,
          HOTEL_LOCATION.lng,
          lat,
          lng
        );
        const checkResult = evaluateDeliveryDistance(distanceKm);
        resolve({ lat, lng, distanceKm, checkResult });
      },
      (err) => {
        let msg = "Could not detect location.";
        if (err.code === 1) msg = "Location permission was denied.";
        else if (err.code === 2) msg = "Location position unavailable.";
        else if (err.code === 3) msg = "Location request timed out.";
        reject(new Error(msg));
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  });
}

export interface GeocodedPlace {
  id: string;
  name: string;
  displayName: string;
  lat: number;
  lng: number;
  distanceKm: number;
  isWithinRadius: boolean;
  type?: string;
}

/**
 * Searches real addresses, landmarks, streets, and areas around Anand using
 * OpenStreetMap Nominatim API + local instant index.
 */
export async function searchDeliveryPlaces(query: string): Promise<GeocodedPlace[]> {
  const q = query.trim();
  if (!q || q.length < 2) return [];

  const lower = q.toLowerCase();
  const results: GeocodedPlace[] = [];
  const seenKeys = new Set<string>();

  // 1. Instant match from curated local Anand landmarks & neighborhoods
  for (const item of ANAND_LANDMARKS) {
    if (
      item.name.toLowerCase().includes(lower) ||
      item.id.toLowerCase().includes(lower) ||
      (item.notes && item.notes.toLowerCase().includes(lower))
    ) {
      const dist = calculateHaversineDistanceKm(
        HOTEL_LOCATION.lat,
        HOTEL_LOCATION.lng,
        item.lat,
        item.lng
      );
      const key = `${item.lat.toFixed(4)},${item.lng.toFixed(4)}`;
      seenKeys.add(key);
      results.push({
        id: `local-${item.id}`,
        name: item.name,
        displayName: `${item.name}, Anand, Gujarat, India`,
        lat: item.lat,
        lng: item.lng,
        distanceKm: dist,
        isWithinRadius: dist <= HOTEL_LOCATION.maxDeliveryRadiusKm,
        type: "landmark",
      });
    }
  }

  // 2. Query OpenStreetMap Nominatim for real addresses, societies, buildings, and streets
  try {
    const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      q.includes("anand") || q.includes("gujarat") ? q : `${q}, Anand, Gujarat`
    )}&viewbox=72.78,22.68,73.12,22.38&bounded=0&countrycodes=in&limit=8&addressdetails=1`;

    const res = await fetch(searchUrl, {
      headers: {
        Accept: "application/json",
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        for (const item of data) {
          const lat = parseFloat(item.lat);
          const lng = parseFloat(item.lon);
          if (isNaN(lat) || isNaN(lng)) continue;

          const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
          if (seenKeys.has(key)) continue;
          seenKeys.add(key);

          const dist = calculateHaversineDistanceKm(
            HOTEL_LOCATION.lat,
            HOTEL_LOCATION.lng,
            lat,
            lng
          );

          // Format clean title
          const name =
            item.name ||
            item.address?.road ||
            item.address?.suburb ||
            item.address?.neighbourhood ||
            item.display_name.split(",")[0];

          results.push({
            id: `osm-${item.place_id || Math.random()}`,
            name,
            displayName: item.display_name,
            lat,
            lng,
            distanceKm: dist,
            isWithinRadius: dist <= HOTEL_LOCATION.maxDeliveryRadiusKm,
            type: item.type || "address",
          });
        }
      }
    }
  } catch (err) {
    console.warn("Nominatim search failed (offline or network rate limit):", err);
  }

  // Sort results: within-radius first, then by distance
  results.sort((a, b) => {
    if (a.isWithinRadius !== b.isWithinRadius) {
      return a.isWithinRadius ? -1 : 1;
    }
    return a.distanceKm - b.distanceKm;
  });

  return results.slice(0, 8);
}

/**
 * Reverse geocodes coordinates to a human-readable street/area address
 */
export async function reverseGeocodeCoords(lat: number, lng: number): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.display_name) {
        return data.display_name;
      }
    }
  } catch (err) {
    console.warn("Reverse geocoding error:", err);
  }
  return `Near Location (${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E), Anand`;
}

/**
 * Geocodes a manually entered address string to calculate distance from Hotel Ambrosia
 */
export async function geocodeAddress(addressStr: string): Promise<GeocodedPlace | null> {
  const q = addressStr.trim();
  if (!q) return null;

  // Check if matches local landmarks first
  const lower = q.toLowerCase();
  const localMatch = ANAND_LANDMARKS.find(
    (l) => lower.includes(l.name.toLowerCase()) || lower.includes(l.id.toLowerCase())
  );
  if (localMatch) {
    const dist = calculateHaversineDistanceKm(
      HOTEL_LOCATION.lat,
      HOTEL_LOCATION.lng,
      localMatch.lat,
      localMatch.lng
    );
    return {
      id: `local-${localMatch.id}`,
      name: localMatch.name,
      displayName: `${localMatch.name}, Anand, Gujarat, India`,
      lat: localMatch.lat,
      lng: localMatch.lng,
      distanceKm: dist,
      isWithinRadius: dist <= HOTEL_LOCATION.maxDeliveryRadiusKm,
    };
  }

  try {
    const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      q.includes("anand") || q.includes("gujarat") ? q : `${q}, Anand, Gujarat`
    )}&limit=1&addressdetails=1`;

    const res = await fetch(searchUrl, {
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);
        const dist = calculateHaversineDistanceKm(
          HOTEL_LOCATION.lat,
          HOTEL_LOCATION.lng,
          lat,
          lng
        );
        return {
          id: `osm-${item.place_id}`,
          name: item.name || q,
          displayName: item.display_name,
          lat,
          lng,
          distanceKm: dist,
          isWithinRadius: dist <= HOTEL_LOCATION.maxDeliveryRadiusKm,
        };
      }
    }
  } catch (err) {
    console.warn("Geocode address error:", err);
  }

  return null;
}

