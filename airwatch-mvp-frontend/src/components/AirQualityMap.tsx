"use client";

import { useRef, useState, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { getAQICategory } from "../utils/airQuality";
import { AirQualityData } from "../utils/airQuality";
import { predictSingleLocation } from "../services/api";

// You'll need to add your Mapbox token to environment variables
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface AirQualityMapProps {
  data: AirQualityData[];
  selectedLayer: string;
  selectedPollutant: string;
  showSensors: boolean;
  showHeatmap: boolean;
  onLocationSelect: (location: AirQualityData | null) => void;
  userLocation?: { lat: number; lng: number };
}

function AirQualityMap({
  data,
  selectedLayer,
  selectedPollutant,
  showSensors,
  showHeatmap,
  onLocationSelect,
  userLocation
}: AirQualityMapProps) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    
    // Check if Mapbox token is available
    if (!MAPBOX_TOKEN || MAPBOX_TOKEN === 'your_mapbox_token_here') {
      console.warn('Mapbox token not configured. Map features will be limited.');
      return;
    }
    
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    // Use user location or default to New York
    const initialCenter: [number, number] = userLocation 
      ? [userLocation.lng, userLocation.lat]
      : [-74.0060, 40.7128];
    
    try {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: initialCenter,
        zoom: 10
      });

      console.log('Map created successfully with token');

      if (mapRef.current) {
        mapRef.current.on('load', () => {
          if (!mapRef.current) return;
          console.log('Map loaded successfully');

          // Add data source
          mapRef.current.addSource('air-quality-data', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: data.map((point, index) => ({
                type: 'Feature',
                properties: {
                  id: index,
                  aqi: point.aqi,
                  pm25: point.pm25,
                  pm10: point.pm10,
                  o3: point.o3,
                  no2: point.no2,
                  name: point.location.name
                },
                geometry: {
                  type: 'Point',
                  coordinates: [point.location.lng, point.location.lat]
                }
              }))
            }
          });

          // Add heatmap layer
          if (showHeatmap && selectedLayer === 'heatmap') {
            mapRef.current.addLayer({
              id: 'heatmap',
              type: 'heatmap',
              source: 'air-quality-data',
              paint: {
                'heatmap-weight': [
                  'interpolate',
                  ['linear'],
                  ['get', selectedPollutant],
                  0, 0,
                  300, 1
                ],
                'heatmap-intensity': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  0, 1,
                  15, 3
                ],
                'heatmap-color': [
                  'interpolate',
                  ['linear'],
                  ['heatmap-density'],
                  0, 'rgba(0, 228, 0, 0)',
                  0.1, 'rgba(0, 228, 0, 0.5)',
                  0.2, 'rgba(255, 255, 0, 0.5)',
                  0.3, 'rgba(255, 126, 0, 0.5)',
                  0.4, 'rgba(255, 0, 0, 0.5)',
                  0.5, 'rgba(143, 63, 151, 0.5)',
                  1, 'rgba(126, 0, 35, 0.5)'
                ],
                'heatmap-radius': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  0, 2,
                  15, 20
                ],
                'heatmap-opacity': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  7, 1,
                  15, 0
                ]
              }
            });
          }

          // Add circle layer for sensor points
          if (showSensors && selectedLayer === 'sensors') {
            mapRef.current.addLayer({
              id: 'sensors',
              type: 'circle',
              source: 'air-quality-data',
              paint: {
                'circle-radius': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  0, 4,
                  15, 12
                ],
                'circle-color': [
                  'interpolate',
                  ['linear'],
                  ['get', selectedPollutant],
                  0, '#059669',
                  50, '#ca8a04',
                  100, '#ea580c',
                  150, '#dc2626',
                  200, '#7c3aed',
                  300, '#7f1d1d'
                ],
                'circle-stroke-width': 2,
                'circle-stroke-color': '#ffffff',
                'circle-opacity': 0.8
              }
            });
          }

          // Add click handler for sensor points (if they exist in the data)
          mapRef.current.on('click', 'sensors', (e) => {
            if (!mapRef.current || !e.features) return;
            
            const feature = e.features[0];
            const point = data[feature.properties?.id];
            
            if (point) {
              onLocationSelect(point);
              
              // Remove existing popup
              const existingPopups = document.getElementsByClassName('mapboxgl-popup');
              if (existingPopups.length) {
                existingPopups[0].remove();
              }
              
              const newPopup = new mapboxgl.Popup()
                .setLngLat([point.location.lng, point.location.lat])
                .setHTML(`
                  <div class="p-2 min-w-[200px]">
                    <h3 class="font-semibold text-sm mb-2">${point.location.name}</h3>
                    <div class="space-y-1 text-xs">
                      <div class="flex justify-between">
                        <span>AQI:</span>
                        <span class="font-medium">${point.aqi}</span>
                      </div>
                      <div class="flex justify-between">
                        <span>PM2.5:</span>
                        <span class="font-medium">${point.pm25} µg/m³</span>
                      </div>
                      <div class="flex justify-between">
                        <span>PM10:</span>
                        <span class="font-medium">${point.pm10} µg/m³</span>
                      </div>
                      <div class="flex justify-between">
                        <span>O3:</span>
                        <span class="font-medium">${point.o3} ppb</span>
                      </div>
                      <div class="mt-2 pt-2 border-t">
                        <p class="text-xs text-gray-500">
                          ${getAQICategory(point.aqi).description}
                        </p>
                      </div>
                    </div>
                  </div>
                `)
                .addTo(mapRef.current);
            }
          });

          // Change cursor on hover
          mapRef.current.on('mouseenter', 'sensors', () => {
            if (mapRef.current) {
              mapRef.current.getCanvas().style.cursor = 'pointer';
            }
          });

          mapRef.current.on('mouseleave', 'sensors', () => {
            if (mapRef.current) {
              mapRef.current.getCanvas().style.cursor = '';
            }
          });

          // Add click handler for anywhere on the map
          mapRef.current.on('click', async (e) => {
            if (!mapRef.current) return;
            
            // Check if click was on a sensor point (handled by other listener)
            // Only query if the sensors layer exists
            let features: mapboxgl.MapboxGeoJSONFeature[] = [];
            try {
              if (mapRef.current.getLayer('sensors')) {
                features = mapRef.current.queryRenderedFeatures(e.point, {
                  layers: ['sensors']
                });
              }
            } catch (error) {
              // Silently ignore - layer might not be loaded yet
            }
            
            // If clicked on sensor, let that handler deal with it
            if (features.length > 0) return;
            
            // Get clicked coordinates
            const { lng, lat } = e.lngLat;
            
            // Remove any existing popup
            const existingPopups = document.getElementsByClassName('mapboxgl-popup');
            if (existingPopups.length) {
              existingPopups[0].remove();
            }
            
            const loadingPopup = new mapboxgl.Popup({ closeButton: false })
              .setLngLat([lng, lat])
              .setHTML(`
                <style>
                  @keyframes spin {
                    to { transform: rotate(360deg); }
                  }
                  .mapboxgl-popup-content {
                    padding: 0 !important;
                    border-radius: 16px !important;
                    background: #ffffff !important;
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.15) !important;
                  }
                </style>
                <div style="
                  background: #ffffff;
                  border-radius: 16px;
                  padding: 20px;
                  min-width: 200px;
                  text-align: center;
                  border: 1px solid #e5e7eb;
                ">
                  <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
                    <div style="
                      width: 20px;
                      height: 20px;
                      border: 3px solid #059669;
                      border-top-color: transparent;
                      border-radius: 50%;
                      animation: spin 1s linear infinite;
                    "></div>
                    <span style="font-size: 14px; color: #1f2937; font-weight: 600;">Loading air quality data...</span>
                  </div>
                </div>
              `)
              .addTo(mapRef.current);
            
            setIsLoadingPrediction(true);
            
            try {
              // Fetch air quality prediction for clicked location
              const result = await predictSingleLocation(lat, lng);
              
              if (result.success && result.data) {
                const point = result.data;
                const category = getAQICategory(point.aqi);
                
                // Remove loading popup
                const existingPopups = document.getElementsByClassName('mapboxgl-popup');
                if (existingPopups.length) {
                  existingPopups[0].remove();
                }
                
                const dataPopup = new mapboxgl.Popup({ 
                  closeButton: false,
                  closeOnClick: true,
                  maxWidth: '320px'
                })
                  .setLngLat([lng, lat])
                  .setHTML(`
                    <style>
                      .mapboxgl-popup-content {
                        padding: 0 !important;
                        border-radius: 20px !important;
                      }
                    </style>
                    <div style="
                      background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
                      border-radius: 20px;
                      padding: 20px;
                      min-width: 280px;
                      border: 1px solid #e5e7eb;
                      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.15);
                    ">
                      <!-- Header -->
                      <div style="display: flex; align-items: center; gap: 16px; margin: 0 -20px 16px -20px; padding: 0 20px 12px 20px; border-bottom: 2px solid rgba(0, 0, 0, 0.1);">
                        <h3 style="
                          font-size: 16px;
                          font-weight: 800;
                          color: #111827;
                          margin: 0;
                        ">
                          Air Quality
                        </h3>
                        <span style="
                          padding: 6px 12px;
                          border-radius: 12px;
                          font-size: 11px;
                          font-weight: 800;
                          text-transform: uppercase;
                          letter-spacing: 0.5px;
                          background: ${category.color}35;
                          color: ${category.color};
                          border: 2px solid ${category.color}60;
                          box-shadow: 0 2px 8px ${category.color}30;
                        ">
                          ${category.level}
                        </span>
                      </div>

                      <!-- Location -->
                      <div style="
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        padding: 10px 12px;
                        background: rgba(59, 130, 246, 0.15);
                        border-radius: 12px;
                        margin-bottom: 16px;
                        border: 1.5px solid rgba(59, 130, 246, 0.3);
                      ">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1e40af" stroke-width="2.5">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        <span style="font-size: 12px; color: #1e3a8a; font-weight: 600;">
                          ${lat.toFixed(4)}°, ${lng.toFixed(4)}°
                        </span>
                      </div>

                      <!-- AQI Display -->
                      <div style="
                        text-align: center;
                        padding: 20px;
                        background: linear-gradient(135deg, ${category.color}25 0%, ${category.color}10 100%);
                        border-radius: 16px;
                        margin-bottom: 16px;
                        border: 2px solid ${category.color}40;
                      ">
                        <div style="font-size: 12px; color: #374151; font-weight: 700; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">
                          Air Quality Index
                        </div>
                        <div style="
                          font-size: 48px;
                          font-weight: 900;
                          color: ${category.color};
                          line-height: 1;
                          text-shadow: 0 2px 4px ${category.color}40;
                          filter: brightness(0.9);
                        ">
                          ${point.aqi}
                        </div>
                        <div style="
                          font-size: 13px;
                          color: #1f2937;
                          margin-top: 8px;
                          font-weight: 500;
                        ">
                          ${category.description}
                        </div>
                      </div>

                      <!-- Pollutants Grid -->
                      <div style="
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 10px;
                        margin-bottom: 12px;
                      ">
                        <div style="
                          background: #f9fafb;
                          padding: 12px;
                          border-radius: 12px;
                          border: 1.5px solid #e5e7eb;
                        ">
                          <div style="font-size: 11px; color: #374151; font-weight: 700; margin-bottom: 4px;">PM2.5</div>
                          <div style="font-size: 16px; font-weight: 800; color: #111827;">
                            ${point.pm25} <span style="font-size: 10px; font-weight: 600; color: #6b7280;">µg/m³</span>
                          </div>
                        </div>
                        <div style="
                          background: #f9fafb;
                          padding: 12px;
                          border-radius: 12px;
                          border: 1.5px solid #e5e7eb;
                        ">
                          <div style="font-size: 11px; color: #374151; font-weight: 700; margin-bottom: 4px;">PM10</div>
                          <div style="font-size: 16px; font-weight: 800; color: #111827;">
                            ${point.pm10} <span style="font-size: 10px; font-weight: 600; color: #6b7280;">µg/m³</span>
                          </div>
                        </div>
                        <div style="
                          background: #f9fafb;
                          padding: 12px;
                          border-radius: 12px;
                          border: 1.5px solid #e5e7eb;
                        ">
                          <div style="font-size: 11px; color: #374151; font-weight: 700; margin-bottom: 4px;">O3</div>
                          <div style="font-size: 16px; font-weight: 800; color: #111827;">
                            ${point.o3} <span style="font-size: 10px; font-weight: 600; color: #6b7280;">ppb</span>
                          </div>
                        </div>
                        <div style="
                          background: #f9fafb;
                          padding: 12px;
                          border-radius: 12px;
                          border: 1.5px solid #e5e7eb;
                        ">
                          <div style="font-size: 11px; color: #374151; font-weight: 700; margin-bottom: 4px;">NO2</div>
                          <div style="font-size: 16px; font-weight: 800; color: #111827;">
                            ${point.no2} <span style="font-size: 10px; font-weight: 600; color: #6b7280;">ppb</span>
                          </div>
                        </div>
                        <div style="
                          background: #f9fafb;
                          padding: 12px;
                          border-radius: 12px;
                          border: 1.5px solid #e5e7eb;
                        ">
                          <div style="font-size: 11px; color: #374151; font-weight: 700; margin-bottom: 4px;">CO</div>
                          <div style="font-size: 16px; font-weight: 800; color: #111827;">
                            ${point.co} <span style="font-size: 10px; font-weight: 600; color: #6b7280;">ppm</span>
                          </div>
                        </div>
                        <div style="
                          background: #f9fafb;
                          padding: 12px;
                          border-radius: 12px;
                          border: 1.5px solid #e5e7eb;
                        ">
                          <div style="font-size: 11px; color: #374151; font-weight: 700; margin-bottom: 4px;">SO2</div>
                          <div style="font-size: 16px; font-weight: 800; color: #111827;">
                            ${point.so2} <span style="font-size: 10px; font-weight: 600; color: #6b7280;">ppb</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  `)
                  .addTo(mapRef.current);
                
                // Add a temporary marker at clicked location
                const marker = new mapboxgl.Marker({ color: category.color })
                  .setLngLat([lng, lat])
                  .addTo(mapRef.current);
                
                // Remove marker when popup closes
                dataPopup.on('close', () => {
                  marker.remove();
                });
                
              } else {
                // Show error popup
                const existingPopups = document.getElementsByClassName('mapboxgl-popup');
                if (existingPopups.length) {
                  existingPopups[0].remove();
                }
                
                const errorPopup = new mapboxgl.Popup({ closeButton: true })
                  .setLngLat([lng, lat])
                  .setHTML(`
                    <div style="
                      background: linear-gradient(135deg, rgba(254, 242, 242, 0.95) 0%, rgba(255, 255, 255, 0.95) 100%);
                      backdrop-filter: blur(20px);
                      -webkit-backdrop-filter: blur(20px);
                      border-radius: 16px;
                      padding: 20px;
                      min-width: 240px;
                      border: 1px solid rgba(239, 68, 68, 0.2);
                      box-shadow: 0 8px 32px 0 rgba(239, 68, 68, 0.15);
                    ">
                      <div style="display: flex; align-items: start; gap: 12px;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="12" y1="8" x2="12" y2="12"/>
                          <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        <div>
                          <div style="font-weight: 700; color: #991b1b; margin-bottom: 6px; font-size: 14px;">
                            Unable to Load Data
                          </div>
                          <div style="font-size: 13px; color: #dc2626;">
                            ${result.error || 'Unable to fetch air quality data'}
                          </div>
                        </div>
                      </div>
                    </div>
                  `)
                  .addTo(mapRef.current);
                
                // Auto-close error popup after 3 seconds
                setTimeout(() => {
                  errorPopup.remove();
                }, 3000);
              }
            } catch (error) {
              console.error('Error fetching prediction:', error);
              
              const existingPopups = document.getElementsByClassName('mapboxgl-popup');
              if (existingPopups.length) {
                existingPopups[0].remove();
              }
              
              const errorPopup = new mapboxgl.Popup({ closeButton: true })
                .setLngLat([lng, lat])
                .setHTML(`
                  <div style="
                    background: linear-gradient(135deg, rgba(254, 242, 242, 0.95) 0%, rgba(255, 255, 255, 0.95) 100%);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border-radius: 16px;
                    padding: 20px;
                    min-width: 240px;
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    box-shadow: 0 8px 32px 0 rgba(239, 68, 68, 0.15);
                  ">
                    <div style="display: flex; align-items: start; gap: 12px;">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      <div>
                        <div style="font-weight: 700; color: #991b1b; margin-bottom: 6px; font-size: 14px;">
                          Connection Error
                        </div>
                        <div style="font-size: 13px; color: #dc2626;">
                          Failed to load air quality data
                        </div>
                      </div>
                    </div>
                  </div>
                `)
                .addTo(mapRef.current);
              
              setTimeout(() => {
                errorPopup.remove();
              }, 3000);
            } finally {
              setIsLoadingPrediction(false);
            }
          });

          mapRef.current.on('error', (e) => {
            // Only log meaningful errors, suppress empty error objects and expected errors
            if (e && Object.keys(e).length > 0 && e.error) {
              const errorMessage = e.error.message || e.error;
              // Suppress expected "layer does not exist" errors
              if (typeof errorMessage === 'string' && errorMessage.includes('does not exist')) {
                return;
              }
              console.error('Map error:', errorMessage);
            }
          });

          mapRef.current.on('style.load', () => {
            console.log('Map style loaded');
          });
        });
      }
    } catch (error) {
      console.error('Error creating map:', error);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // Only run once on mount - userLocation is the only dependency we need
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation]);

  // Update data when props change
  useEffect(() => {
    if (!mapRef.current || !mapRef.current.isStyleLoaded()) return;

    const source = mapRef.current.getSource('air-quality-data') as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features: data.map((point, index) => ({
          type: 'Feature',
          properties: {
            id: index,
            aqi: point.aqi,
            pm25: point.pm25,
            pm10: point.pm10,
            o3: point.o3,
            no2: point.no2,
            name: point.location.name
          },
          geometry: {
            type: 'Point',
            coordinates: [point.location.lng, point.location.lat]
          }
        }))
      });

      // Fit bounds to show all data points (only if we have multiple points)
      if (data.length > 1 && mapRef.current) {
        const bounds = new mapboxgl.LngLatBounds();
        data.forEach(point => {
          bounds.extend([point.location.lng, point.location.lat]);
        });
        
        mapRef.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 12,
          duration: 1000
        });
      }
    }
  }, [data]);

  // Update layers when props change
  useEffect(() => {
    if (!mapRef.current || !mapRef.current.isStyleLoaded()) return;

    // Remove existing layers
    if (mapRef.current.getLayer('heatmap')) {
      mapRef.current.removeLayer('heatmap');
    }
    if (mapRef.current.getLayer('sensors')) {
      mapRef.current.removeLayer('sensors');
    }

    // Add layers based on current props
    if (showHeatmap && selectedLayer === 'heatmap') {
      mapRef.current.addLayer({
        id: 'heatmap',
        type: 'heatmap',
        source: 'air-quality-data',
        paint: {
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', selectedPollutant],
            0, 0,
            300, 1
          ],
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 1,
            15, 3
          ],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0, 228, 0, 0)',
            0.1, 'rgba(0, 228, 0, 0.5)',
            0.2, 'rgba(255, 255, 0, 0.5)',
            0.3, 'rgba(255, 126, 0, 0.5)',
            0.4, 'rgba(255, 0, 0, 0.5)',
            0.5, 'rgba(143, 63, 151, 0.5)',
            1, 'rgba(126, 0, 35, 0.5)'
          ],
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 2,
            15, 20
          ],
          'heatmap-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            7, 1,
            15, 0
          ]
        }
      });
    }

    if (showSensors && selectedLayer === 'sensors') {
      mapRef.current.addLayer({
        id: 'sensors',
        type: 'circle',
        source: 'air-quality-data',
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 4,
            15, 12
          ],
          'circle-color': [
            'interpolate',
            ['linear'],
            ['get', selectedPollutant],
            0, '#059669',
            50, '#ca8a04',
            100, '#ea580c',
            150, '#dc2626',
            200, '#7c3aed',
            300, '#7f1d1d'
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.8
        }
      });
    }
  }, [selectedLayer, selectedPollutant, showSensors, showHeatmap]);

  return (
    <div className="w-full h-full relative">
      {/* Show warning if Mapbox token is missing */}
      {(!MAPBOX_TOKEN || MAPBOX_TOKEN === 'your_mapbox_token_here') && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="max-w-md p-6 bg-white rounded-lg shadow-lg text-center">
            <svg className="w-16 h-16 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Mapbox Token Required</h3>
            <p className="text-gray-600 mb-4">
              To display the interactive map, you need to configure a Mapbox access token.
            </p>
            <div className="text-left bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Steps to configure:</p>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Get a free token from <a href="https://www.mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">mapbox.com</a></li>
                <li>Add to <code className="bg-gray-200 px-1 rounded">.env.local</code>:</li>
              </ol>
              <pre className="mt-2 text-xs bg-gray-800 text-green-400 p-2 rounded overflow-x-auto">
                NEXT_PUBLIC_MAPBOX_TOKEN=your_token_here
              </pre>
            </div>
            <p className="text-xs text-gray-500">
              Air quality data can still be accessed via other pages
            </p>
          </div>
        </div>
      )}
      
      <div 
        ref={mapContainerRef} 
        className="w-full h-full" 
        style={{ minHeight: '700px', width: '100%' }}
      />
      
      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => {
            if (mapRef.current) {
              mapRef.current.zoomIn();
            }
          }}
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            padding: '8px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
        <button
          onClick={() => {
            if (mapRef.current) {
              mapRef.current.zoomOut();
            }
          }}
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            padding: '8px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
          </svg>
        </button>
      </div>

      {/* Map Attribution */}
      <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white px-2 py-1 rounded shadow">
        © Mapbox © OpenStreetMap
      </div>

      {/* Instruction tooltip */}
      {!isLoadingPrediction && (
        <div className="absolute bottom-2 left-2 bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
            <span className="font-medium">Click anywhere on the map</span>
            <span>to get air quality prediction</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default AirQualityMap;