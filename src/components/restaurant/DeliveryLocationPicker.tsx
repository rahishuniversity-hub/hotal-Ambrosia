"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MapPinIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import {
  HOTEL_LOCATION,
  calculateHaversineDistanceKm,
  searchDeliveryPlaces,
  reverseGeocodeCoords,
  geocodeAddress,
  detectCurrentLocation,
  GeocodedPlace,
} from "@/lib/delivery";

interface DeliveryLocationPickerProps {
  initialAddress?: string;
  initialDistanceKm?: number;
  isDeliveryEligible?: boolean;
  deliveryCheckMessage?: string;
  onLocationApproved: (data: {
    address: string;
    distanceKm: number;
    lat: number;
    lng: number;
  }) => void;
  onLocationRejected: (data: {
    address: string;
    distanceKm: number;
    lat: number;
    lng: number;
  }) => void;
  onAddressChange: (address: string) => void;
  onSwitchToTakeaway: () => void;
}

const POPULAR_AREAS = [
  "Borsad Char Rasta",
  "Vallabh Vidyanagar",
  "Amul Dairy",
  "Station Road",
  "Karamsad",
  "Nana Bazar",
];

export default function DeliveryLocationPicker({
  initialAddress = "",
  initialDistanceKm = 0,
  isDeliveryEligible = false,
  deliveryCheckMessage = "",
  onLocationApproved,
  onLocationRejected,
  onAddressChange,
  onSwitchToTakeaway,
}: DeliveryLocationPickerProps) {
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GeocodedPlace[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Address and coordinates state
  const [fullAddress, setFullAddress] = useState(initialAddress);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [distanceKm, setDistanceKm] = useState<number>(initialDistanceKm);
  const [isEligible, setIsEligible] = useState<boolean>(isDeliveryEligible);

  // GPS state
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsError, setGpsError] = useState("");

  // Manual verify state
  const [isVerifyingAddress, setIsVerifyingAddress] = useState(false);

  // Map state
  const [mapZoom, setMapZoom] = useState(13);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Keep internal address in sync with props
  useEffect(() => {
    if (initialAddress !== fullAddress) {
      setFullAddress(initialAddress || "");
      if (!initialAddress) {
        setCoords(null);
        setSearchQuery("");
      }
    }
  }, [initialAddress]);

  useEffect(() => {
    setDistanceKm(initialDistanceKm);
    setIsEligible(isDeliveryEligible);
  }, [initialDistanceKm, isDeliveryEligible]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const places = await searchDeliveryPlaces(searchQuery);
        setSearchResults(places);
        setShowDropdown(true);
      } catch (err) {
        console.error("Place search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [searchQuery]);

  // Handle selecting a place from search results
  const handleSelectPlace = (place: GeocodedPlace) => {
    const dist = calculateHaversineDistanceKm(
      HOTEL_LOCATION.lat,
      HOTEL_LOCATION.lng,
      place.lat,
      place.lng
    );
    const eligible = dist <= HOTEL_LOCATION.maxDeliveryRadiusKm;

    setCoords({ lat: place.lat, lng: place.lng });
    setDistanceKm(dist);
    setIsEligible(eligible);
    setSearchQuery("");
    setShowDropdown(false);

    // Keep existing flat/house number if already typed, or use place display name
    let newAddress = place.displayName;
    if (fullAddress && !fullAddress.includes(place.name)) {
      newAddress = `${fullAddress.split(",")[0]}, ${place.displayName}`;
    }
    setFullAddress(newAddress);
    onAddressChange(newAddress);

    if (eligible) {
      onLocationApproved({
        address: newAddress,
        distanceKm: dist,
        lat: place.lat,
        lng: place.lng,
      });
    } else {
      onLocationRejected({
        address: newAddress,
        distanceKm: dist,
        lat: place.lat,
        lng: place.lng,
      });
    }
  };

  // Handle GPS detect
  const handleDetectGps = async () => {
    setIsDetectingGps(true);
    setGpsError("");
    try {
      const res = await detectCurrentLocation();
      const dist = res.distanceKm;
      const eligible = dist <= HOTEL_LOCATION.maxDeliveryRadiusKm;

      setCoords({ lat: res.lat, lng: res.lng });
      setDistanceKm(dist);
      setIsEligible(eligible);

      // Reverse geocode to get a real address
      let resolvedAddress = `Near (${res.lat.toFixed(4)}, ${res.lng.toFixed(4)}), Anand`;
      try {
        resolvedAddress = await reverseGeocodeCoords(res.lat, res.lng);
      } catch {
        // Ignore fallback
      }

      setFullAddress(resolvedAddress);
      onAddressChange(resolvedAddress);

      if (eligible) {
        onLocationApproved({
          address: resolvedAddress,
          distanceKm: dist,
          lat: res.lat,
          lng: res.lng,
        });
      } else {
        onLocationRejected({
          address: resolvedAddress,
          distanceKm: dist,
          lat: res.lat,
          lng: res.lng,
        });
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "GPS location unavailable. Please search or enter your address below.";
      setGpsError(msg);
    } finally {
      setIsDetectingGps(false);
    }
  };

  // Handle manual address verify
  const handleVerifyManualAddress = async () => {
    if (!fullAddress.trim()) return;
    setIsVerifyingAddress(true);
    try {
      const place = await geocodeAddress(fullAddress);
      if (place) {
        handleSelectPlace(place);
      } else {
        // Fallback: estimate as central Anand if no exact match found
        setGpsError("Could not determine exact pin coordinates for this address. Please choose a nearby landmark from search.");
      }
    } catch {
      setGpsError("Verification timed out. You can also pick from search.");
    } finally {
      setIsVerifyingAddress(false);
    }
  };

  // Handle Map Click to place pin
  const handleMapPinClick = async (lat: number, lng: number) => {
    const dist = calculateHaversineDistanceKm(
      HOTEL_LOCATION.lat,
      HOTEL_LOCATION.lng,
      lat,
      lng
    );
    const eligible = dist <= HOTEL_LOCATION.maxDeliveryRadiusKm;

    setCoords({ lat, lng });
    setDistanceKm(dist);
    setIsEligible(eligible);

    // Reverse geocode
    const placeName = await reverseGeocodeCoords(lat, lng);
    setFullAddress(placeName);
    onAddressChange(placeName);

    if (eligible) {
      onLocationApproved({
        address: placeName,
        distanceKm: dist,
        lat,
        lng,
      });
    } else {
      onLocationRejected({
        address: placeName,
        distanceKm: dist,
        lat,
        lng,
      });
    }
  };

  // Current center for map view
  const currentLat = coords ? coords.lat : HOTEL_LOCATION.lat;
  const currentLng = coords ? coords.lng : HOTEL_LOCATION.lng;

  return (
    <div className="space-y-4">
      {/* Header Policy Pill */}
      <div className="bg-cream/40 p-3 rounded-xl border border-cream text-xs space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-charcoal flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gold"></span>
            Hotel Ambrosia Delivery Radius:
          </span>
          <span className="px-2 py-0.5 rounded-full bg-gold/20 text-gold-dark font-bold text-[11px]">
            Strict ≤ 10 KM Zone
          </span>
        </div>
        <p className="text-warm-gray text-[11px]">
          Serving Anand & Vidyanagar. Search any street, society, building or landmark below to verify distance.
        </p>
      </div>

      {/* 1. Address Search with Autocomplete */}
      <div ref={searchContainerRef} className="relative">
        <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
          Search Location / Address / Landmark
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (searchResults.length > 0) setShowDropdown(true);
            }}
            placeholder="Type building, society, street, or area in Anand..."
            className="w-full pl-9 pr-8 py-2.5 bg-white border border-cream rounded-lg text-sm text-charcoal focus:outline-none focus:border-gold transition-colors shadow-sm"
          />
          <MagnifyingGlassIcon className="w-4 h-4 text-warm-gray absolute left-3 top-3" />
          {isSearching ? (
            <ArrowPathIcon className="w-4 h-4 text-gold animate-spin absolute right-3 top-3" />
          ) : searchQuery ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSearchResults([]);
                setShowDropdown(false);
              }}
              className="absolute right-3 top-3 text-warm-gray hover:text-charcoal"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          ) : null}
        </div>

        {/* Popular Area Quick Suggestions */}
        {!searchQuery && (
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-warm-gray">Popular:</span>
            {POPULAR_AREAS.map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => {
                  setSearchQuery(area);
                }}
                className="text-[11px] px-2 py-0.5 bg-warm-white hover:bg-gold/15 text-charcoal hover:text-gold-dark rounded border border-cream/80 transition-colors"
              >
                {area}
              </button>
            ))}
          </div>
        )}

        {/* Autocomplete Dropdown */}
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-cream rounded-xl shadow-xl max-h-64 overflow-y-auto divide-y divide-cream/60">
            {searchResults.map((place) => (
              <button
                key={place.id}
                type="button"
                onClick={() => handleSelectPlace(place)}
                className="w-full text-left p-3 hover:bg-cream/30 transition-colors flex items-start justify-between gap-3 group"
              >
                <div className="flex items-start gap-2 min-w-0">
                  <MapPinIcon
                    className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                      place.isWithinRadius ? "text-emerald-600" : "text-red-500"
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-charcoal group-hover:text-gold-dark truncate">
                      {place.name}
                    </p>
                    <p className="text-xs text-warm-gray truncate">
                      {place.displayName}
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                      place.isWithinRadius
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    ~{place.distanceKm} km
                  </span>
                  <p className="text-[10px] text-warm-gray mt-0.5">
                    {place.isWithinRadius ? "✓ Within 10 km" : "✕ > 10 km"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. GPS Detect & Quick Actions */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleDetectGps}
          disabled={isDetectingGps}
          className="flex-1 py-2 px-3 bg-charcoal hover:bg-charcoal-lighter text-gold rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
        >
          {isDetectingGps ? (
            <>
              <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
              <span>Detecting GPS Location...</span>
            </>
          ) : (
            <>
              <MapPinIcon className="w-3.5 h-3.5" />
              <span>📍 Detect My Location (GPS)</span>
            </>
          )}
        </button>
      </div>

      {gpsError && (
        <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs flex items-start gap-2">
          <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">GPS Note:</p>
            <p className="text-[11px] text-amber-800">{gpsError}</p>
          </div>
        </div>
      )}

      {/* 3. Interactive Map & Pin Selection */}
      <div className="border border-cream rounded-xl overflow-hidden shadow-sm bg-white">
        <div className="bg-cream/40 px-3 py-2 border-b border-cream flex items-center justify-between text-xs">
          <span className="font-bold text-charcoal flex items-center gap-1.5">
            <span className="text-base">🗺️</span> Delivery Map & Pin
          </span>
          <span className="text-[11px] text-warm-gray">
            Click map to adjust pin
          </span>
        </div>

        {/* Embedded Interactive Map View (OpenStreetMap centered on Hotel Ambrosia & customer pin) */}
        <div className="relative h-44 w-full bg-cream/20 overflow-hidden">
          <iframe
            title="Hotel Ambrosia Delivery Radius Map"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${(
              currentLng - 0.08
            ).toFixed(4)}%2C${(currentLat - 0.06).toFixed(4)}%2C${(
              currentLng + 0.08
            ).toFixed(4)}%2C${(currentLat + 0.06).toFixed(
              4
            )}&layer=mapnik&marker=${currentLat.toFixed(5)}%2C${currentLng.toFixed(5)}`}
            className="w-full h-full border-0"
            loading="lazy"
          />

          {/* Quick Pin Overlay Controls */}
          <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
            <button
              type="button"
              onClick={() => {
                // Center on Hotel Ambrosia
                setCoords({ lat: HOTEL_LOCATION.lat, lng: HOTEL_LOCATION.lng });
              }}
              title="Center on Hotel Ambrosia"
              className="px-2 py-1 bg-white/90 backdrop-blur-sm text-charcoal hover:text-gold text-[10px] font-bold rounded shadow border border-cream"
            >
              🏨 Ambrosia
            </button>
          </div>

          {/* Map Info Bar Badge */}
          <div className="absolute bottom-2 left-2 right-2 bg-charcoal/90 backdrop-blur-md text-white px-3 py-1.5 rounded-lg flex items-center justify-between text-[11px] shadow-lg">
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-gold">🏨 Hotel Ambrosia</span>
              <span className="text-white/40">➔</span>
              <span className="truncate">
                {coords ? (
                  isEligible ? (
                    <span className="text-emerald-400 font-bold">Your Location (~{distanceKm} km)</span>
                  ) : (
                    <span className="text-red-400 font-bold">Your Location (~{distanceKm} km)</span>
                  )
                ) : (
                  <span className="text-white/70">Pin your location</span>
                )}
              </span>
            </div>
            {distanceKm > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  isEligible
                    ? "bg-emerald-500 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                {isEligible ? "Approved" : "Rejected"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 4. Full Delivery Address (Editable with house/flat number) */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-charcoal">
            Full Delivery Address (Flat / House No. / Landmark)
          </label>
          {fullAddress && (
            <button
              type="button"
              onClick={handleVerifyManualAddress}
              disabled={isVerifyingAddress}
              className="text-[11px] text-gold-dark font-semibold hover:underline flex items-center gap-1"
            >
              {isVerifyingAddress ? (
                <ArrowPathIcon className="w-3 h-3 animate-spin" />
              ) : null}
              Verify Distance
            </button>
          )}
        </div>
        <textarea
          rows={2}
          value={fullAddress}
          onChange={(e) => {
            setFullAddress(e.target.value);
            onAddressChange(e.target.value);
          }}
          placeholder="e.g. Flat 302, Royal Palace, Near Borsad Char Rasta, Anand - 388001"
          className="w-full px-3 py-2 bg-white border border-cream rounded-lg text-sm text-charcoal focus:outline-none focus:border-gold transition-colors shadow-sm"
        />
        <p className="text-[11px] text-warm-gray mt-1">
          Please include apartment/flat number and building name for smooth doorstep delivery.
        </p>
      </div>

      {/* 5. Approved / Rejected Decision Card */}
      {distanceKm > 0 && (
        <div className="pt-1">
          {isEligible ? (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-xl flex items-start gap-3 shadow-sm">
              <CheckCircleIcon className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    ✓ Delivery Approved (≤ 10 KM)
                  </p>
                  <span className="px-2 py-0.5 bg-emerald-200/70 text-emerald-900 rounded-full font-bold text-[11px]">
                    ~{distanceKm} km
                  </span>
                </div>
                <p className="text-xs text-emerald-800 mt-1">
                  Your address is within our 10 KM delivery radius from Hotel Ambrosia, Anand. Hot, fresh delivery is available!
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-red-50 border border-red-300 text-red-950 rounded-xl flex items-start gap-3 shadow-sm">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-red-800">
                    ✕ Delivery Rejected (&gt; 10 KM)
                  </p>
                  <span className="px-2 py-0.5 bg-red-200/80 text-red-900 rounded-full font-bold text-[11px]">
                    ~{distanceKm} km away
                  </span>
                </div>
                <p className="text-xs text-red-800 mt-1">
                  Your location is ~{distanceKm} km away, which exceeds our maximum 10 KM fresh delivery zone from Hotel Ambrosia, Anand.
                </p>
                <div className="mt-2.5 pt-2 border-t border-red-200/80 flex items-center justify-between">
                  <span className="text-[11px] text-red-700">
                    Would you like to pick up your order?
                  </span>
                  <button
                    type="button"
                    onClick={onSwitchToTakeaway}
                    className="px-3 py-1.5 bg-charcoal hover:bg-charcoal-lighter text-gold rounded-lg text-xs font-bold transition-colors shadow"
                  >
                    Switch to Takeaway (Pickup)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
