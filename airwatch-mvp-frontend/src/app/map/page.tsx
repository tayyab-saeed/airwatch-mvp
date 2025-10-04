"use client";

import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "antd";

export default function MapPage() {
  return (
    <DashboardLayout>
      <div className="w-full">
        <Card className="h-[calc(100vh-180px)]">
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Map will be integrated here. The card takes most of the viewport height
            to give maximum space for the map visualization.
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}