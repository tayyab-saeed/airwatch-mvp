"use client";

import DashboardLayout from "../../components/DashboardLayout";
import { Card, Form, Input, Select, Switch, Space, Button } from "antd";

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="w-full max-w-2xl">
        <Card title="Application Settings">
          <Form layout="vertical">
            <Form.Item label="Theme Mode" name="themeMode">
              <Select
                defaultValue="light"
                options={[
                  { label: "Light", value: "light" },
                  { label: "Dark", value: "dark" },
                  { label: "System", value: "system" },
                ]}
              />
            </Form.Item>
            
            <Form.Item label="API Endpoint" name="apiEndpoint">
              <Input placeholder="https://api.airwatch.example.com" />
            </Form.Item>

            <Form.Item label="Update Frequency (minutes)" name="updateFrequency">
              <Select
                defaultValue={5}
                options={[
                  { label: "1 minute", value: 1 },
                  { label: "5 minutes", value: 5 },
                  { label: "15 minutes", value: 15 },
                  { label: "30 minutes", value: 30 },
                ]}
              />
            </Form.Item>

            <Form.Item label="Notifications" name="notifications">
              <Space direction="vertical">
                <Space>
                  <Switch defaultChecked /> Push Notifications
                </Space>
                <Space>
                  <Switch defaultChecked /> Email Alerts
                </Space>
                <Space>
                  <Switch /> SMS Alerts
                </Space>
              </Space>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary">Save Changes</Button>
                <Button>Reset</Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </DashboardLayout>
  );
}