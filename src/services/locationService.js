/**
 * Location Service - Distance calculations and location utilities
 * 
 * Uses Haversine formula to calculate distances between coordinates
 */

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Get user's current location
 * @returns {Promise<{lat: number, lon: number}>} User coordinates
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        // Fallback to default location (Mumbai, India)
        console.warn('Geolocation error, using default location:', error);
        resolve({
          lat: 19.0760,
          lon: 72.8777,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  });
};

/**
 * Sort dealers by distance from user location
 * @param {Array} dealers - Array of dealer objects
 * @param {number} userLat - User latitude
 * @param {number} userLon - User longitude
 * @returns {Array} Sorted dealers with calculated distances
 */
export const sortDealersByDistance = (dealers, userLat, userLon) => {
  return dealers
    .map((dealer) => {
      if (!dealer.coordinates) {
        // If dealer doesn't have coordinates, assign a default distance
        return {
          ...dealer,
          calculatedDistance: parseFloat(dealer.distance) || 999,
        };
      }

      const distance = calculateDistance(
        userLat,
        userLon,
        dealer.coordinates.lat,
        dealer.coordinates.lon
      );

      return {
        ...dealer,
        calculatedDistance: distance,
        distance: `${distance.toFixed(1)} km`,
      };
    })
    .sort((a, b) => a.calculatedDistance - b.calculatedDistance);
};

/**
 * Filter dealers within a certain radius
 * @param {Array} dealers - Array of dealer objects
 * @param {number} userLat - User latitude
 * @param {number} userLon - User longitude
 * @param {number} radiusKm - Radius in kilometers
 * @returns {Array} Filtered dealers within radius
 */
export const filterDealersByRadius = (dealers, userLat, userLon, radiusKm) => {
  return dealers.filter((dealer) => {
    if (!dealer.coordinates) return true; // Include dealers without coordinates
    
    const distance = calculateDistance(
      userLat,
      userLon,
      dealer.coordinates.lat,
      dealer.coordinates.lon
    );
    
    return distance <= radiusKm;
  });
};

/**
 * Format distance for display
 * @param {number} distanceKm - Distance in kilometers
 * @returns {string} Formatted distance string
 */
export const formatDistance = (distanceKm) => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
};

