"use client";

import { useState, useEffect } from "react";
import { Card, Select, Button, Row, Col, Table, Tag, Statistic, DatePicker, App } from "antd";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  MapPin, 
  Download,
  Share2
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import dayjs from "dayjs";
import { getAQICategory, getAQIColor } from "../utils/airQuality";
import { predictAirQuality } from "../services/api";
import { BackendLocation } from "../types/api";

interface ComparisonData {
  location: string;
  aqi: number;
  pm25: number;
  pm10: number;
  o3: number;
  trend: "up" | "down" | "stable";
  trendPercentage: number;
  lastUpdated: string;
}

interface ComparisonToolProps {
  selectedLocations?: string[];
}

export default function ComparisonTool({ selectedLocations = [] }: ComparisonToolProps) {
  const { message } = App.useApp(); // Use hook-based API
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>([
    dayjs().subtract(7, 'day'), 
    dayjs()
  ]);
  const [loading, setLoading] = useState(false);
  const [selectedLocationsState, setSelectedLocationsState] = useState<string[]>(selectedLocations);

  // Location coordinates mapping
  const locationCoordinates: Record<string, BackendLocation> = {
    "Downtown": { Latitude: 40.7128, Longitude: -74.0060 },
    "Central Park": { Latitude: 40.7829, Longitude: -73.9654 },
    "Brooklyn": { Latitude: 40.6782, Longitude: -73.9442 },
    "Queens": { Latitude: 40.7282, Longitude: -73.7949 },
    "Bronx": { Latitude: 40.8448, Longitude: -73.8648 },
    "Manhattan": { Latitude: 40.7831, Longitude: -73.9712 },
    "Staten Island": { Latitude: 40.5795, Longitude: -74.1502 },
    "Long Island": { Latitude: 40.7891, Longitude: -73.1350 },
    "Westchester": { Latitude: 41.0339, Longitude: -73.7629 },
    "Newark": { Latitude: 40.7357, Longitude: -74.1724 }
  };

  const locations = Object.keys(locationCoordinates);

  // Fetch comparison data from API
  const fetchComparisonData = async (locationNames: string[]) => {
    setLoading(true);
    try {
      // Get coordinates for selected locations
      const locationList: BackendLocation[] = locationNames
        .map(name => locationCoordinates[name])
        .filter(Boolean);
      
      if (locationList.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch data from API
      const result = await predictAirQuality(locationList, locationNames);
      
      if (result.success && result.data) {
        // Transform to comparison data format
        const compData: ComparisonData[] = result.data.map(item => {
          // Calculate trend (random for now since we don't have historical data)
          const trend = Math.random() > 0.5 ? "up" : "down" as "up" | "down";
          const trendPercentage = Math.random() * 20;
          
          return {
            location: item.location.name,
            aqi: item.aqi,
            pm25: item.pm25,
            pm10: item.pm10,
            o3: item.o3,
            trend,
            trendPercentage,
            lastUpdated: item.timestamp
          };
        });
        
        setComparisonData(compData);
      } else {
        message.error(result.error || "Failed to fetch comparison data");
        setComparisonData([]);
      }
    } catch (error) {
      message.error("Error fetching comparison data");
      setComparisonData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedLocationsState.length > 0) {
      fetchComparisonData(selectedLocationsState);
    } else {
      setComparisonData([]);
    }
  }, [selectedLocationsState, dateRange]);

  const handleLocationChange = (value: string[]) => {
    setSelectedLocationsState(value);
  };

  const handleExport = () => {
    // Export functionality
    console.log("Exporting comparison data...");
  };

  const handleShare = () => {
    // Share functionality
    console.log("Sharing comparison...");
  };

  // Prepare chart data
  const chartData = comparisonData.map(item => ({
    location: item.location,
    aqi: item.aqi,
    pm25: item.pm25,
    pm10: item.pm10,
    o3: item.o3
  }));

  // Table columns
  const columns = [
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      render: (text: string) => (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span className="font-medium">{text}</span>
        </div>
      )
    },
    {
      title: "AQI",
      dataIndex: "aqi",
      key: "aqi",
      render: (value: number) => (
        <div className="flex items-center gap-2">
          <Tag color={getAQIColor(value)} className="px-2 py-1 rounded-full">
            {value}
          </Tag>
          <span className="text-sm text-gray-600">
            {getAQICategory(value).level}
          </span>
        </div>
      ),
      sorter: (a: ComparisonData, b: ComparisonData) => a.aqi - b.aqi
    },
    {
      title: "PM2.5",
      dataIndex: "pm25",
      key: "pm25",
      render: (value: number) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{value}</span>
          <span className="text-xs text-gray-500">µg/m³</span>
        </div>
      ),
      sorter: (a: ComparisonData, b: ComparisonData) => a.pm25 - b.pm25
    },
    {
      title: "PM10",
      dataIndex: "pm10",
      key: "pm10",
      render: (value: number) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{value}</span>
          <span className="text-xs text-gray-500">µg/m³</span>
        </div>
      ),
      sorter: (a: ComparisonData, b: ComparisonData) => a.pm10 - b.pm10
    },
    {
      title: "O3",
      dataIndex: "o3",
      key: "o3",
      render: (value: number) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{value}</span>
          <span className="text-xs text-gray-500">ppb</span>
        </div>
      ),
      sorter: (a: ComparisonData, b: ComparisonData) => a.o3 - b.o3
    },
    {
      title: "Trend",
      dataIndex: "trend",
      key: "trend",
      render: (trend: string, record: ComparisonData) => (
        <div className="flex items-center gap-1">
          {trend === "up" ? (
            <TrendingUp className="w-4 h-4 text-red-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-green-500" />
          )}
          <span className={`text-sm ${trend === "up" ? "text-red-500" : "text-green-500"}`}>
            {record.trendPercentage.toFixed(1)}%
          </span>
        </div>
      )
    },
    {
      title: "Last Updated",
      dataIndex: "lastUpdated",
      key: "lastUpdated",
      render: (timestamp: string) => (
        <span className="text-sm text-gray-500">
          {format(new Date(timestamp), "MMM dd, HH:mm")}
        </span>
      )
    }
  ];

  // Calculate statistics
  const avgAQI = comparisonData.reduce((sum, item) => sum + item.aqi, 0) / comparisonData.length;
  const bestLocation = comparisonData.reduce((best, current) => 
    current.aqi < best.aqi ? current : best
  );
  const worstLocation = comparisonData.reduce((worst, current) => 
    current.aqi > worst.aqi ? current : worst
  );

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={6}>
              <div>
                <h3 className="text-lg font-semibold">Location Comparison</h3>
                <p className="text-gray-600">Compare air quality across locations</p>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                mode="multiple"
                placeholder="Select locations"
                value={selectedLocationsState}
                onChange={handleLocationChange}
                className="w-full"
                options={locations.map(loc => ({ label: loc, value: loc }))}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <DatePicker.RangePicker
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
                className="w-full"
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div className="flex gap-2">
                <Button icon={<Download className="w-4 h-4" />} onClick={handleExport}>
                  Export
                </Button>
                <Button icon={<Share2 className="w-4 h-4" />} onClick={handleShare}>
                  Share
                </Button>
              </div>
            </Col>
          </Row>
        </Card>
      </motion.div>

      {/* Summary Statistics */}
      {comparisonData.length > 0 && (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card>
                <Statistic
                  title="Average AQI"
                  value={Math.round(avgAQI)}
                  prefix={<BarChart3 className="w-4 h-4" />}
                  valueStyle={{ color: getAQIColor(avgAQI) }}
                />
              </Card>
            </motion.div>
          </Col>
          <Col xs={24} sm={8}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <Statistic
                  title="Best Location"
                  value={bestLocation.location}
                  prefix={<TrendingDown className="w-4 h-4 text-green-500" />}
                  suffix={`(${bestLocation.aqi})`}
                />
              </Card>
            </motion.div>
          </Col>
          <Col xs={24} sm={8}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card>
                <Statistic
                  title="Worst Location"
                  value={worstLocation.location}
                  prefix={<TrendingUp className="w-4 h-4 text-red-500" />}
                  suffix={`(${worstLocation.aqi})`}
                />
              </Card>
            </motion.div>
          </Col>
        </Row>
      )}

      {/* Comparison Chart */}
      {comparisonData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card title="Air Quality Comparison Chart" loading={loading}>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="location" 
                    stroke="#666"
                    fontSize={12}
                    tick={{ fill: '#666' }}
                  />
                  <YAxis 
                    stroke="#666"
                    fontSize={12}
                    tick={{ fill: '#666' }}
                  />
                  <RechartsTooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="aqi" 
                    stroke="#16a34a" 
                    strokeWidth={2}
                    name="AQI"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pm25" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="PM2.5"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pm10" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    name="PM10"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="o3" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    name="O3"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Comparison Table */}
      {comparisonData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card title="Detailed Comparison" loading={loading}>
            <Table
              columns={columns}
              dataSource={comparisonData}
              rowKey="location"
              pagination={false}
              scroll={{ x: 800 }}
            />
          </Card>
        </motion.div>
      )}

      {/* No Data State */}
      {comparisonData.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Locations Selected</h3>
              <p className="text-gray-500 mb-4">Select locations to compare their air quality data</p>
              <Button type="primary" onClick={() => setSelectedLocationsState(["Downtown", "Central Park"])}>
                Add Sample Locations
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
