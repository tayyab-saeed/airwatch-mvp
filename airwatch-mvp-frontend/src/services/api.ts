/**
 * API Service Layer
 * Handles all communication with the NASA Hackathon 2025 Backend
 */

import {
  BackendLocation,
  BackendRequest,
  BackendResponse,
  ApiResponse,
  ApiError,
  HealthCheckResponse,
} from '@/types/api';
import { AirQualityData } from '@/utils/airQuality';
import { transformBatchPredictions, validateLocation } from '@/utils/dataTransform';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nasa-hackathon-2025-backend.onrender.com';
const API_TIMEOUT = 15000; // 15 seconds

/**
 * Fetch wrapper with timeout
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Convert fetch error to ApiError
 */
function handleApiError(error: unknown): ApiError {
  if (error instanceof Error) {
    if (error.name === 'AbortError') {
      return {
        message: 'Request timeout. The server is taking too long to respond.',
        code: 'TIMEOUT',
      };
    }
    
    if (error.message.includes('fetch')) {
      return {
        message: 'Network error. Please check your internet connection.',
        code: 'NETWORK_ERROR',
      };
    }
    
    return {
      message: error.message,
    };
  }
  
  return {
    message: 'An unexpected error occurred',
  };
}

/**
 * Retry logic with exponential backoff
 */
async function retryRequest<T>(
  requestFn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> {
  try {
    return await requestFn();
  } catch (error) {
    if (retries === 0) {
      throw error;
    }
    
    console.warn(`Request failed, retrying in ${delay}ms... (${retries} retries left)`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryRequest(requestFn, retries - 1, delay * 2);
  }
}

/**
 * Main API function: Predict air quality for given locations
 */
export async function predictAirQuality(
  locations: BackendLocation[],
  locationNames?: string[],
  useRetry: boolean = true
): Promise<ApiResponse<AirQualityData[]>> {
  try {
    // Validate all locations
    const invalidLocations = locations.filter(loc => !validateLocation(loc));
    if (invalidLocations.length > 0) {
      return {
        success: false,
        error: `Invalid coordinates detected: ${invalidLocations.length} location(s)`,
      };
    }
    
    // Prepare request
    const request: BackendRequest = { locations };
    
    // Make API call with optional retry
    const makeRequest = async () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[API Request] POST /predict', request);
      }
      
      const response = await fetchWithTimeout(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: BackendResponse = await response.json();
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[API Response] /predict', data);
      }
      
      return data;
    };
    
    const predictions = useRetry
      ? await retryRequest(makeRequest, 3, 1000)
      : await makeRequest();
    
    // Transform to frontend format
    const transformedData = transformBatchPredictions(
      predictions,
      locations,
      locationNames
    );
    
    return {
      success: true,
      data: transformedData,
    };
  } catch (error) {
    const apiError = handleApiError(error);
    return {
      success: false,
      error: apiError.message,
    };
  }
}

/**
 * Test API connection and health
 */
export async function testConnection(): Promise<ApiResponse<HealthCheckResponse>> {
  try {
    // Try a simple prediction with a known location to test connectivity
    const testLocation: BackendLocation = {
      Latitude: 40.7128,
      Longitude: -74.0060,
    };
    
    const startTime = Date.now();
    const response = await fetchWithTimeout(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ locations: [testLocation] }),
    });
    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      await response.json(); // Consume response body
      return {
        success: true,
        data: {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          message: `API is healthy (${responseTime}ms response time)`,
        },
      };
    }
    
    return {
      success: false,
      error: 'API returned unexpected response',
    };
  } catch (error) {
    const apiError = handleApiError(error);
    return {
      success: false,
      data: {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        message: apiError.message,
      },
    };
  }
}

/**
 * Get predictions for a single location (convenience function)
 */
export async function predictSingleLocation(
  lat: number,
  lng: number,
  locationName?: string
): Promise<ApiResponse<AirQualityData>> {
  const result = await predictAirQuality(
    [{ Latitude: lat, Longitude: lng }],
    locationName ? [locationName] : undefined
  );
  
  if (result.success && result.data && result.data.length > 0) {
    return {
      success: true,
      data: result.data[0],
    };
  }
  
  return {
    success: false,
    error: result.error || 'Failed to get prediction',
  };
}

/**
 * Simple cache implementation for predictions
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const predictionCache = new Map<string, CacheEntry<AirQualityData>>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get cached prediction or fetch new one
 */
export async function getCachedPrediction(
  lat: number,
  lng: number,
  locationName?: string
): Promise<ApiResponse<AirQualityData>> {
  // Create cache key (rounded to 2 decimals for better cache hits)
  const cacheKey = `${lat.toFixed(2)},${lng.toFixed(2)}`;
  
  // Check cache
  const cached = predictionCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return {
      success: true,
      data: cached.data,
    };
  }
  
  // Fetch new data
  const result = await predictSingleLocation(lat, lng, locationName);
  
  // Cache successful results
  if (result.success && result.data) {
    predictionCache.set(cacheKey, {
      data: result.data,
      timestamp: Date.now(),
    });
  }
  
  return result;
}

/**
 * Clear prediction cache
 */
export function clearCache(): void {
  predictionCache.clear();
}

export default {
  predictAirQuality,
  predictSingleLocation,
  getCachedPrediction,
  testConnection,
  clearCache,
};

