"use client";

import { useState, useEffect } from "react";
import { Card, Row, Col, Select, Button, Tooltip } from "antd";
import { 
  Layers, 
  MapPin, 
  Thermometer,
  Download,
  Share2
} from "lucide-react";
import { motion } from "framer-motion";
import DashboardLayout from "../../components/DashboardLayout";
import { AirQualityData } from "../../utils/airQuality";
import MapWrapper from "../../components/MapWrapper";

export default function MapPage() {
  const [selectedLayer, setSelectedLayer] = useState("sensors");
  const [showSensors, setShowSensors] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [selectedPollutant, setSelectedPollutant] = useState("aqi");
  const [timeRange, setTimeRange] = useState("realtime");
  const [mapData] = useState<AirQualityData[]>([]); // Empty array - data fetched on click only
  const [, setSelectedLocation] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);

  // Get user's geolocation for centering the map
  useEffect(() => {
    if (!navigator.geolocation) {
      const defaultLocation = { lat: 40.7128, lng: -74.0060 };
      setUserLocation(defaultLocation);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(location);
      },
      (error) => {
        console.log("Geolocation error:", error.message);
        const defaultLocation = { lat: 40.7128, lng: -74.0060 };
        setUserLocation(defaultLocation);
      },
      { timeout: 10000 }
    );
  }, []);

  const layerOptions = [
    { value: "heatmap", label: "Heat Map", icon: <Thermometer className="w-4 h-4" /> },
    { value: "sensors", label: "Sensor Points", icon: <MapPin className="w-4 h-4" /> },
    { value: "contours", label: "Contour Lines", icon: <Layers className="w-4 h-4" /> }
  ];

  const pollutantOptions = [
    { value: "aqi", label: "AQI", color: "#16a34a" },
    { value: "pm25", label: "PM2.5", color: "#3b82f6" },
    { value: "pm10", label: "PM10", color: "#8b5cf6" },
    { value: "o3", label: "Ozone", color: "#f59e0b" },
    { value: "no2", label: "NO2", color: "#ef4444" }
  ];

  const timeRangeOptions = [
    { value: "realtime", label: "Real-time" },
    { value: "1hour", label: "1 Hour" },
    { value: "24hours", label: "24 Hours" },
    { value: "7days", label: "7 Days" }
  ];

  return (
    <DashboardLayout>
      <div className="w-full h-full flex flex-col">
        {/* Map Controls */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mb-4">
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={12} md={6}>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Visualization Layer</label>
                  <Select
                    value={selectedLayer}
                    onChange={setSelectedLayer}
                    className="w-full"
                    options={layerOptions.map(option => ({
                      value: option.value,
                      label: (
                        <div className="flex items-center gap-2">
                          {option.icon}
                          {option.label}
                        </div>
                      )
                    }))}
                  />
                </div>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Pollutant</label>
                  <Select
                    value={selectedPollutant}
                    onChange={setSelectedPollutant}
                    className="w-full"
                    options={pollutantOptions.map(option => ({
                      value: option.value,
                      label: (
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: option.color }}
                          />
                          {option.label}
                        </div>
                      )
                    }))}
                  />
                </div>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Time Range</label>
                  <Select
                    value={timeRange}
                    onChange={setTimeRange}
                    className="w-full"
                    options={timeRangeOptions}
                  />
                </div>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <div className="flex gap-2">
                  <Tooltip title="Export Map">
                    <Button icon={<Download className="w-4 h-4" />} disabled />
                  </Tooltip>
                  <Tooltip title="Share Map">
                    <Button icon={<Share2 className="w-4 h-4" />} disabled />
                  </Tooltip>
                </div>
              </Col>
            </Row>

            {/* Instructions */}
            <Row className="mt-4">
              <Col span={24}>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1">How to Use Interactive Map</h4>
                      <p className="text-sm text-blue-800 mb-2">
                        Click anywhere on the map to get real-time air quality predictions for that location.
                      </p>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• <strong>Click any spot</strong> → Get instant AQI and pollutant data</li>
                        <li>• <strong>Color-coded markers</strong> → Green (Good) to Red (Unhealthy)</li>
                        <li>• <strong>Detailed popup</strong> → PM2.5, PM10, O3, NO2, CO, SO2 levels</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Map Legend */}
                <div className="bg-white rounded-lg shadow-lg p-4 mt-4 max-w-xs">
                  <h4 className="font-medium mb-2">AQI Color Scale</h4>
                  <div className="space-y-1">
                    {[
                      { range: "0-50", label: "Good", color: "#059669" },
                      { range: "51-100", label: "Moderate", color: "#ca8a04" },
                      { range: "101-150", label: "Unhealthy for Sensitive", color: "#ea580c" },
                      { range: "151-200", label: "Unhealthy", color: "#dc2626" },
                      { range: "201-300", label: "Very Unhealthy", color: "#7c3aed" },
                      { range: "301+", label: "Hazardous", color: "#7f1d1d" }
                    ].map((item) => (
                      <div key={item.range} className="flex items-center gap-2">
                        <div 
                          className="w-5 h-5 rounded flex-shrink-0 border border-gray-200"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-xs font-medium text-gray-700 min-w-[45px]">{item.range}</span>
                        <span className="text-xs text-gray-600">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </motion.div>

        {/* Map Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ flex: 1 }}
        >
          <Card className="h-full" classNames={{body: 'p-0'}}>
            <div className="w-full h-full">
              <MapWrapper
                data={mapData}
                selectedLayer={selectedLayer}
                selectedPollutant={selectedPollutant}
                showSensors={showSensors}
                showHeatmap={showHeatmap}
                onLocationSelect={setSelectedLocation}
                userLocation={userLocation || undefined}
              />
            </div>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}