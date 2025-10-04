"use client";

import React from "react";
import HeaderBar from "./HeaderBar";
import Sidebar from "./Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-[#0b3b16]">
      <HeaderBar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 py-6 px-8 page-container">{children}</main>
      </div>
    </div>
  );
}
