"use client";

import { useState, useEffect } from "react";
import { Card, Form, Input, Select, Switch, Button, Row, Col, Divider, Alert, Slider, InputNumber, ColorPicker, Tabs, App, Spin } from "antd";
import { 
  Settings, 
  Bell, 
  Map, 
  Database, 
  Palette, 
  Download, 
  Upload,
  Save,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Activity,
} from "lucide-react";
import { motion } from "framer-motion";
import DashboardLayout from "../../components/DashboardLayout";
import { InfoCircleOutlined } from "@ant-design/icons";
import { testConnection } from "../../services/api";

export default function SettingsPage() {
  const { message } = App.useApp(); // Use hook-based API
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [apiStatus, setApiStatus] = useState<{
    status: 'healthy' | 'unhealthy' | 'checking';
    message?: string;
    timestamp?: string;
  }>({ status: 'checking' });

  // Check API health on component mount
  useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    setApiStatus({ status: 'checking' });
    try {
      const result = await testConnection();
      if (result.success && result.data) {
        setApiStatus({
          status: result.data.status,
          message: result.data.message,
          timestamp: result.data.timestamp,
        });
      } else {
        setApiStatus({
          status: 'unhealthy',
          message: result.error || 'Unable to connect to API',
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      setApiStatus({
        status: 'unhealthy',
        message: 'Error checking API health',
        timestamp: new Date().toISOString(),
      });
    }
  };

  const handleSave = async (values: any) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      console.log("Settings saved:", values);
      message.success("Settings saved successfully");
      setLoading(false);
    }, 1000);
  };

  const handleReset = () => {
    form.resetFields();
    message.info("Settings reset to defaults");
  };

  const GeneralSettings = () => (
    <div className="space-y-6">
      <Card title="General Preferences" className="mb-6">
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item label="Theme Mode" name="themeMode" initialValue="light">
                <Select
                  options={[
                    { label: "Light", value: "light" },
                    { label: "Dark", value: "dark" },
                    { label: "System", value: "system" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Language" name="language" initialValue="en">
                <Select
                  options={[
                    { label: "English", value: "en" },
                    { label: "Spanish", value: "es" },
                    { label: "French", value: "fr" },
                    { label: "German", value: "de" },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item label="Default Location" name="defaultLocation">
                <Input placeholder="Enter city or coordinates" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Units" name="units" initialValue="metric">
                <Select
                  options={[
                    { label: "Metric", value: "metric" },
                    { label: "Imperial", value: "imperial" },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Update Frequency" name="updateFrequency" initialValue={5}>
            <Slider
              min={1}
              max={60}
              marks={{
                1: "1m",
                5: "5m",
                15: "15m",
                30: "30m",
                60: "1h"
              }}
            />
          </Form.Item>
        </Form>
      </Card>

      <Card title="API Connection" className="mb-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="font-medium mb-2 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Backend API Status
              </div>
              
              {apiStatus.status === 'checking' ? (
                <div className="flex items-center gap-2">
                  <Spin size="small" />
                  <span className="text-sm text-gray-500">Checking API connection...</span>
                </div>
              ) : (
                <Alert
                  message={apiStatus.status === 'healthy' ? 'API Connected' : 'API Connection Failed'}
                  description={apiStatus.message}
                  type={apiStatus.status === 'healthy' ? 'success' : 'error'}
                  icon={
                    apiStatus.status === 'healthy' ? 
                      <CheckCircle className="w-4 h-4" /> : 
                      <AlertCircle className="w-4 h-4" />
                  }
                  showIcon
                  action={
                    <Button 
                      size="small" 
                      icon={<RefreshCw className="w-3 h-3" />}
                      onClick={checkApiHealth}
                    >
                      Refresh
                    </Button>
                  }
                />
              )}
            </div>
          </div>

          <Divider />

          <Form.Item 
            label="Primary API Endpoint" 
            name="primaryApi" 
            initialValue={process.env.NEXT_PUBLIC_API_URL || "https://nasa-hackathon-2025-backend.onrender.com"}
          >
            <Input disabled placeholder="https://api.airwatch.example.com" />
          </Form.Item>
          
          <div className="text-xs text-gray-500">
            <p>API Endpoint: {process.env.NEXT_PUBLIC_API_URL || "https://nasa-hackathon-2025-backend.onrender.com"}</p>
            {apiStatus.timestamp && (
              <p>Last checked: {new Date(apiStatus.timestamp).toLocaleString()}</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );

  const NotificationSettings = () => (
    <div className="space-y-6">
      <Card title="Alert Thresholds" className="mb-6">
        <div className="space-y-4">
          <Form.Item label="AQI Warning Threshold" name="aqiWarning" initialValue={100}>
            <InputNumber min={0} max={500} className="w-full" />
          </Form.Item>
          
          <Form.Item label="AQI Critical Threshold" name="aqiCritical" initialValue={200}>
            <InputNumber min={0} max={500} className="w-full" />
          </Form.Item>

          <Form.Item label="PM2.5 Warning Threshold" name="pm25Warning" initialValue={35}>
            <InputNumber min={0} max={500} className="w-full" />
          </Form.Item>
        </div>
      </Card>

      <Card title="Notification Channels" className="mb-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Push Notifications</div>
              <div className="text-sm text-gray-500">Receive alerts on your device</div>
            </div>
            <Form.Item name="pushNotifications" valuePropName="checked" initialValue={true}>
              <Switch />
            </Form.Item>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Email Alerts</div>
              <div className="text-sm text-gray-500">Get notified via email</div>
            </div>
            <Form.Item name="emailAlerts" valuePropName="checked" initialValue={true}>
              <Switch />
            </Form.Item>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">SMS Alerts</div>
              <div className="text-sm text-gray-500">Receive text message alerts</div>
            </div>
            <Form.Item name="smsAlerts" valuePropName="checked" initialValue={false}>
              <Switch />
            </Form.Item>
          </div>

          <Form.Item label="Email Address" name="email">
            <Input placeholder="your.email@example.com" />
          </Form.Item>

          <Form.Item label="Phone Number" name="phone">
            <Input placeholder="+1 (555) 123-4567" />
          </Form.Item>
        </div>
      </Card>

      <Card title="Alert Schedule" className="mb-6">
        <div className="space-y-4">
          <Form.Item label="Quiet Hours" name="quietHours" initialValue={false}>
            <Switch />
          </Form.Item>
          
          <Form.Item label="Quiet Hours Start" name="quietStart" initialValue="22:00">
            <Input placeholder="22:00" />
          </Form.Item>
          
          <Form.Item label="Quiet Hours End" name="quietEnd" initialValue="07:00">
            <Input placeholder="07:00" />
          </Form.Item>
        </div>
      </Card>
    </div>
  );

  const MapSettings = () => (
    <div className="space-y-6">
      <Card title="Map Configuration" className="mb-6">
        <div className="space-y-4">
          <Form.Item label="Default Map Style" name="mapStyle" initialValue="light">
            <Select
              options={[
                { label: "Light", value: "light" },
                { label: "Dark", value: "dark" },
                { label: "Satellite", value: "satellite" },
                { label: "Terrain", value: "terrain" },
              ]}
            />
          </Form.Item>

          <Form.Item label="Default Zoom Level" name="defaultZoom" initialValue={10}>
            <Slider min={1} max={20} />
          </Form.Item>

          <Form.Item label="Show Traffic" name="showTraffic" valuePropName="checked" initialValue={false}>
            <Switch />
          </Form.Item>

          <Form.Item label="Show Weather" name="showWeather" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
        </div>
      </Card>

      <Card title="Visualization Options" className="mb-6">
        <div className="space-y-4">
          <Form.Item label="Heatmap Opacity" name="heatmapOpacity" initialValue={0.7}>
            <Slider min={0} max={1} step={0.1} />
          </Form.Item>

          <Form.Item label="Sensor Point Size" name="sensorSize" initialValue={8}>
            <Slider min={4} max={20} />
          </Form.Item>

          <Form.Item label="Animation Speed" name="animationSpeed" initialValue={1}>
            <Slider min={0.1} max={3} step={0.1} />
          </Form.Item>
        </div>
      </Card>
    </div>
  );

  const AppearanceSettings = () => (
    <div className="space-y-6">
      <Card title="Color Scheme" className="mb-6">
        <div className="space-y-4">
          <Form.Item label="Primary Color" name="primaryColor" initialValue="#16a34a">
            <ColorPicker />
          </Form.Item>

          <Form.Item label="Good AQI Color" name="goodColor" initialValue="#059669">
            <ColorPicker />
          </Form.Item>

          <Form.Item label="Moderate AQI Color" name="moderateColor" initialValue="#ca8a04">
            <ColorPicker />
          </Form.Item>

          <Form.Item label="Unhealthy AQI Color" name="unhealthyColor" initialValue="#dc2626">
            <ColorPicker />
          </Form.Item>
        </div>
      </Card>

      <Card title="Chart Preferences" className="mb-6">
        <div className="space-y-4">
          <Form.Item label="Chart Animation" name="chartAnimation" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>

          <Form.Item label="Chart Grid Lines" name="chartGrid" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>

          <Form.Item label="Data Point Labels" name="dataLabels" valuePropName="checked" initialValue={false}>
            <Switch />
          </Form.Item>
        </div>
      </Card>
    </div>
  );

  const DataManagement = () => (
    <div className="space-y-6">
      <Card title="Data Export" className="mb-6">
        <div className="space-y-4">
          <Form.Item label="Export Format" name="exportFormat" initialValue="csv">
            <Select
              options={[
                { label: "CSV", value: "csv" },
                { label: "JSON", value: "json" },
                { label: "Excel", value: "excel" },
              ]}
            />
          </Form.Item>

          <Form.Item label="Date Range" name="dateRange" initialValue="7days">
            <Select
              options={[
                { label: "Last 24 hours", value: "24hours" },
                { label: "Last 7 days", value: "7days" },
                { label: "Last 30 days", value: "30days" },
                { label: "Custom range", value: "custom" },
              ]}
            />
          </Form.Item>

          <Button type="primary" icon={<Download className="w-4 h-4" />}>
            Export Data
          </Button>
        </div>
      </Card>

      <Card title="Data Import" className="mb-6">
        <div className="space-y-4">
          <Button icon={<Upload className="w-4 h-4" />}>
            Import Configuration
          </Button>
          
          <Alert
            message="Import Guidelines"
            description="Supported formats: JSON, CSV. Maximum file size: 10MB."
            type="info"
            icon={<InfoCircleOutlined className="w-4 h-4" />}
            showIcon
          />
        </div>
      </Card>

      <Card title="Data Management" className="mb-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Auto-cleanup Old Data</div>
              <div className="text-sm text-gray-500">Automatically remove data older than 90 days</div>
            </div>
            <Form.Item name="autoCleanup" valuePropName="checked" initialValue={true}>
              <Switch />
            </Form.Item>
          </div>

          <Form.Item label="Data Retention Period" name="retentionPeriod" initialValue={90}>
            <InputNumber min={1} max={365} className="w-full" />
          </Form.Item>

          <Button danger>
            Clear All Data
          </Button>
        </div>
      </Card>
    </div>
  );

  const tabItems = [
    {
      key: "general",
      label: (
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          General
        </div>
      ),
      children: <GeneralSettings />
    },
    {
      key: "notifications",
      label: (
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4" />
          Notifications
        </div>
      ),
      children: <NotificationSettings />
    },
    {
      key: "map",
      label: (
        <div className="flex items-center gap-2">
          <Map className="w-4 h-4" />
          Map
        </div>
      ),
      children: <MapSettings />
    },
    {
      key: "appearance",
      label: (
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Appearance
        </div>
      ),
      children: <AppearanceSettings />
    },
    {
      key: "data",
      label: (
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4" />
          Data
        </div>
      ),
      children: <DataManagement />
    }
  ];

  return (
    <DashboardLayout>
      <div className="w-full max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Configure your AirWatch experience</p>
          </div>

          <Card>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={tabItems}
              className="settings-tabs"
            />
            
            <Divider />
            
            <div className="flex justify-end gap-2">
              <Button onClick={handleReset} icon={<RotateCcw className="w-4 h-4" />}>
                Reset
              </Button>
              <Button 
                type="primary" 
                loading={loading}
                onClick={() => form.submit()}
                icon={<Save className="w-4 h-4" />}
              >
                Save Changes
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}