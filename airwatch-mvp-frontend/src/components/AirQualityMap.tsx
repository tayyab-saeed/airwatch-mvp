"use client";

import { useRef, useState } from "react";
import { Map, Source, Layer, Marker, Popup } from "react-map-gl";
import { motion } from "framer-motion";
import { getAQIColor, getAQICategory } from "../utils/airQuality";
import { AirQualityData } from "../utils/airQuality";

// You'll need to add your Mapbox token to environment variables
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw";

interface AirQualityMapProps {
  data: AirQualityData[];
  selectedLayer: string;
  selectedPollutant: string;
  showSensors: boolean;
  showHeatmap: boolean;
  onLocationSelect: (location: AirQualityData | null) => void;
}

function AirQualityMap({
  data,
  selectedLayer,
  selectedPollutant,
  showSensors,
  showHeatmap,
  onLocationSelect
}: AirQualityMapProps) {
  const mapRef = useRef(null);
  const [selectedMarker, setSelectedMarker] = useState<AirQualityData | null>(null);
  const [viewState, setViewState] = useState({
    longitude: -74.0060,
    latitude: 40.7128,
    zoom: 10
  });

  // Generate heatmap data
  const heatmapData = {
    type: "FeatureCollection" as const,
    features: data.map((point, index) => ({
      type: "Feature" as const,
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
        type: "Point" as const,
        coordinates: [point.location.lng, point.location.lat]
      }
    }))
  };

  // Heatmap layer style
  const heatmapLayer = {
    id: "heatmap",
    type: "heatmap" as const,
    paint: {
      "heatmap-weight": [
        "interpolate",
        ["linear"],
        ["get", selectedPollutant],
        0, 0,
        300, 1
      ] as any,
      "heatmap-intensity": [
        "interpolate",
        ["linear"],
        ["zoom"],
        0, 1,
        15, 3
      ] as any,
      "heatmap-color": [
        "interpolate",
        ["linear"],
        ["heatmap-density"],
        0, "rgba(0, 228, 0, 0)",
        0.1, "rgba(0, 228, 0, 0.5)",
        0.2, "rgba(255, 255, 0, 0.5)",
        0.3, "rgba(255, 126, 0, 0.5)",
        0.4, "rgba(255, 0, 0, 0.5)",
        0.5, "rgba(143, 63, 151, 0.5)",
        1, "rgba(126, 0, 35, 0.5)"
      ] as any,
      "heatmap-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        0, 2,
        15, 20
      ] as any,
      "heatmap-opacity": [
        "interpolate",
        ["linear"],
        ["zoom"],
        7, 1,
        15, 0
      ] as any
    }
  };

  // Circle layer for sensor points
  const circleLayer = {
    id: "sensors",
    type: "circle" as const,
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        0, 4,
        15, 12
      ] as any,
      "circle-color": [
        "interpolate",
        ["linear"],
        ["get", selectedPollutant],
        0, "#00e400",
        50, "#ffff00",
        100, "#ff7e00",
        150, "#ff0000",
        200, "#8f3f97",
        300, "#7e0023"
      ] as any,
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff",
      "circle-opacity": 0.8
    }
  };

  const handleMarkerClick = (point: AirQualityData) => {
    setSelectedMarker(point);
    onLocationSelect(point);
  };

  const SensorMarker = ({ point }: { point: AirQualityData }) => {
    const aqiColor = getAQIColor(point.aqi);
    
    return (
      <Marker
        longitude={point.location.lng}
        latitude={point.location.lat}
        onClick={() => handleMarkerClick(point)}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
        >
          <div
            className="w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: aqiColor }}
          >
            {point.aqi}
          </div>
        </motion.div>
      </Marker>
    );
  };

  return (
    <div className="w-full h-full relative">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        attributionControl={false}
      >
        {/* Heatmap Layer */}
        {showHeatmap && selectedLayer === "heatmap" && (
          <Source id="heatmap" type="geojson" data={heatmapData}>
            <Layer {...heatmapLayer} />
          </Source>
        )}

        {/* Sensor Points Layer */}
        {showSensors && selectedLayer === "sensors" && (
          <Source id="sensors" type="geojson" data={heatmapData}>
            <Layer {...circleLayer} />
          </Source>
        )}

        {/* Individual Markers */}
        {showSensors && selectedLayer === "sensors" && (
          <>
            {data.map((point, index) => (
              <SensorMarker key={index} point={point} />
            ))}
          </>
        )}

        {/* Popup for selected marker */}
        {selectedMarker && (
          <Popup
            longitude={selectedMarker.location.lng}
            latitude={selectedMarker.location.lat}
            onClose={() => {
              setSelectedMarker(null);
              onLocationSelect(null);
            }}
            closeButton={true}
            closeOnClick={false}
            anchor="bottom"
            offset={[0, -10]}
          >
            <div className="p-2 min-w-[200px]">
              <h3 className="font-semibold text-sm mb-2">{selectedMarker.location.name}</h3>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>AQI:</span>
                  <span className="font-medium">{selectedMarker.aqi}</span>
                </div>
                <div className="flex justify-between">
                  <span>PM2.5:</span>
                  <span className="font-medium">{selectedMarker.pm25} µg/m³</span>
                </div>
                <div className="flex justify-between">
                  <span>PM10:</span>
                  <span className="font-medium">{selectedMarker.pm10} µg/m³</span>
                </div>
                <div className="flex justify-between">
                  <span>O3:</span>
                  <span className="font-medium">{selectedMarker.o3} ppb</span>
                </div>
                <div className="mt-2 pt-2 border-t">
                  <p className="text-xs text-gray-600">
                    {getAQICategory(selectedMarker.aqi).description}
                  </p>
                </div>
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => setViewState(prev => ({ ...prev, zoom: prev.zoom + 1 }))}
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
          onClick={() => setViewState(prev => ({ ...prev, zoom: prev.zoom - 1 }))}
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
    </div>
  );
}

export default AirQualityMap;
