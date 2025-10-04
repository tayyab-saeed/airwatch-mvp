"use client";

import { Card, Col, Row, Statistic } from "antd";
import DashboardLayout from "../../components/DashboardLayout";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="w-full">
        <Row gutter={[20, 20]}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic title="AQI (Now)" value={42} suffix={<span className="text-sm">Good</span>} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic title="PM2.5 (µg/m³)" value={12} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic title="PM10 (µg/m³)" value={20} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic title="O3 (ppb)" value={15} />
            </Card>
          </Col>
        </Row>

        <div className="mt-6">
          <Card title="Air Quality Trends (placeholder)">
            <div className="h-[480px] w-full flex items-center justify-center text-gray-400">
              Chart will go here (map integration and charts to be added)
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}