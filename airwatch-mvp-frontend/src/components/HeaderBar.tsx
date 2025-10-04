"use client";

import React from "react";
import dynamic from "next/dynamic";

const LottieIcon = dynamic(() => import("./LottieIcon"), { ssr: false });

export default function HeaderBar() {
  return (
    <header className="w-full border-b border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto flex items-center justify-between py-4 px-6">
        <div className="flex items-center gap-3">
          {/* try to render Lottie if the animation file is present in public/animations */}
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center overflow-hidden">
            {/* If you place the Lottie json at public/animations/Greenify the Earth.json
                the LottieIcon component will render it. Otherwise this inline svg is shown. */}
            <LottieIcon src="animations/Greenify the Earth.json" size={40} />
          </div>
          <h1 className="text-lg font-semibold text-[#0b3b16]">AirWatch Dashboard</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">Welcome, Admin</div>
        </div>
      </div>
    </header>
  );
}
