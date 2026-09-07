export const DEFAULT_GEO_VERIFICATION_RADIUS_METERS = Number(
  process.env.GEOTAG_VERIFICATION_RADIUS_METERS || 125
);

const geocodeCache = new Map();

export const geocodePlace = async (place) => {
  const query = String(place || '').trim();
  if (!query) return null;
  const cacheKey = query.toLowerCase();
  if (geocodeCache.has(cacheKey)) return geocodeCache.get(cacheKey);

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`, {
      headers: { Accept: 'application/json', 'User-Agent': 'CoopServe/1.0 location resolver' }
    });
    if (!response.ok) return null;
    const results = await response.json();
    const result = results?.[0];
    if (!result) return null;
    const coordinates = { latitude: Number(result.lat), longitude: Number(result.lon) };
    if (!Number.isFinite(coordinates.latitude) || !Number.isFinite(coordinates.longitude)) return null;
    geocodeCache.set(cacheKey, coordinates);
    return coordinates;
  } catch {
    return null;
  }
};

export const getAllowedGeotagRadiusMeters = () => {
  const parsed = Number(process.env.GEOTAG_VERIFICATION_RADIUS_METERS);
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }
  return DEFAULT_GEO_VERIFICATION_RADIUS_METERS;
};

export const haversineDistanceMeters = (lat1, lon1, lat2, lon2) => {
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const earthRadiusMeters = 6371000;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusMeters * c;
};

export const verifyLocationAgainstCustomer = ({
  customerLatitude,
  customerLongitude,
  providerLatitude,
  providerLongitude,
  allowedRadiusMeters = getAllowedGeotagRadiusMeters()
}) => {
  const hasInvalidCoordinate = (latitude, longitude) => {
    if (latitude == null || longitude == null) {
      return true;
    }

    const lat = Number(latitude);
    const lon = Number(longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return true;
    }

    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return true;
    }

    return false;
  };

  if (
    hasInvalidCoordinate(customerLatitude, customerLongitude) ||
    hasInvalidCoordinate(providerLatitude, providerLongitude)
  ) {
    return {
      distanceMeters: null,
      isVerified: false,
      allowedRadiusMeters,
      reason: 'Invalid customer or provider coordinates. Latitude must be between -90 and 90, and longitude must be between -180 and 180.'
    };
  }

  const distanceMeters = haversineDistanceMeters(
    Number(customerLatitude),
    Number(customerLongitude),
    Number(providerLatitude),
    Number(providerLongitude)
  );

  return {
    distanceMeters,
    isVerified: Number(distanceMeters) <= Number(allowedRadiusMeters),
    allowedRadiusMeters,
    reason: Number(distanceMeters) <= Number(allowedRadiusMeters)
      ? 'Provider is within the allowed service radius.'
      : `Provider is ${Math.round(distanceMeters)}m away from the service location; the allowed radius is ${allowedRadiusMeters}m.`
  };
};
