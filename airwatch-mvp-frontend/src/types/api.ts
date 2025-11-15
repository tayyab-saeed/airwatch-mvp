/**
 * Backend API Types
 * Types for communication with the NASA Hackathon 2025 Backend
 */

// Backend Request/Response Types (Uppercase as per backend schema)
export interface BackendLocation {
  Latitude: number;
  Longitude: number;
}

export interface BackendPrediction {
  AQI: number;
  PM2_5: number;
  PM10: number;
  O3: number;
  NO2: number;
  CO: number;
  SO2: number;
}

export interface BackendRequest {
  locations: BackendLocation[];
}

export type BackendResponse = BackendPrediction[];

// API Service Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// API Health Check
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  message?: string;
}


