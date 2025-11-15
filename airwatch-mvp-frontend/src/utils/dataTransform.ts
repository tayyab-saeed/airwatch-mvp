/**
 * Data Transformation Utilities
 * Converts backend response format to frontend format
 */

import { BackendPrediction, BackendLocation } from '@/types/api';
import { AirQualityData } from '@/utils/airQuality';

/**
 * Transform backend prediction to frontend AirQualityData format
 */
export function backendToFrontend(
  prediction: BackendPrediction,
  location: BackendLocation,
  locationName?: string
): AirQualityData {
  return {
    aqi: prediction.AQI,
    pm25: prediction.PM2_5,
    pm10: prediction.PM10,
    o3: prediction.O3,
    no2: prediction.NO2,
    co: prediction.CO,
    so2: prediction.SO2,
    timestamp: new Date().toISOString(),
    location: {
      lat: location.Latitude,
      lng: location.Longitude,
      name: locationName || generateLocationName(location.Latitude, location.Longitude),
    },
  };
}

/**
 * Transform multiple backend predictions to frontend format
 */
export function transformBatchPredictions(
  predictions: BackendPrediction[],
  locations: BackendLocation[],
  locationNames?: string[]
): AirQualityData[] {
  return predictions.map((prediction, index) =>
    backendToFrontend(
      prediction,
      locations[index],
      locationNames?.[index]
    )
  );
}

/**
 * Generate a default location name from coordinates
 */
export function generateLocationName(lat: number, lng: number): string {
  // Format coordinates to 2 decimal places
  const latFormatted = lat.toFixed(2);
  const lngFormatted = lng.toFixed(2);
  
  // Determine hemisphere
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  
  return `${Math.abs(parseFloat(latFormatted))}°${latDir}, ${Math.abs(parseFloat(lngFormatted))}°${lngDir}`;
}

/**
 * Validate coordinates are within valid ranges
 */
export function validateCoordinates(lat: number, lng: number): boolean {
  return (
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !isNaN(lat) &&
    !isNaN(lng)
  );
}

/**
 * Validate a BackendLocation object
 */
export function validateLocation(location: BackendLocation): boolean {
  return (
    location &&
    typeof location.Latitude === 'number' &&
    typeof location.Longitude === 'number' &&
    validateCoordinates(location.Latitude, location.Longitude)
  );
}

/**
 * Generate a grid of locations for map area
 */
export function generateLocationGrid(
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  },
  gridSize: number = 4
): BackendLocation[] {
  const locations: BackendLocation[] = [];
  
  const latStep = (bounds.north - bounds.south) / gridSize;
  const lngStep = (bounds.east - bounds.west) / gridSize;
  
  for (let i = 0; i <= gridSize; i++) {
    for (let j = 0; j <= gridSize; j++) {
      const lat = bounds.south + latStep * i;
      const lng = bounds.west + lngStep * j;
      
      if (validateCoordinates(lat, lng)) {
        locations.push({
          Latitude: lat,
          Longitude: lng,
        });
      }
    }
  }
  
  return locations;
}

/**
 * Add timestamp to existing data
 */
export function addTimestamp<T extends { timestamp?: string }>(data: T): T {
  return {
    ...data,
    timestamp: new Date().toISOString(),
  };
}
