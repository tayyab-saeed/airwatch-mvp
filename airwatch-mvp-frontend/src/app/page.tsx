"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Wind, Leaf, TrendingDown, Activity } from "lucide-react";
import HeaderBar from "../components/HeaderBar";

export default function HomePage() {
  const router = useRouter();

  return (
    <>
      <HeaderBar />
      <div className="min-h-screen relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=2070')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/70 via-emerald-800/60 to-teal-700/70" />
        
        {/* Animated particles/elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                y: [null, Math.random() * window.innerHeight],
                x: [null, Math.random() * window.innerWidth],
              }}
              transition={{
                duration: Math.random() * 10 + 20,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
        </div>
      </div>

      {/* Header - needs padding for fixed navbar */}
      <div className="pt-16" />

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-200px)]">
          
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-block mb-4"
            >
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <Leaf className="w-4 h-4 text-green-300" />
                <span className="text-sm text-white font-medium">Real-time Air Quality Monitoring</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight"
            >
              Explore Clean Air
              <span className="block mt-2 bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">
                Quality Data
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-green-50 mb-8 leading-relaxed max-w-xl"
            >
              Monitor real-time air quality across your region. Get instant insights on pollutants, 
              health recommendations, and predictive forecasts. Make informed decisions for a 
              healthier tomorrow, powered by NASA satellite data and advanced AI analytics.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              <button
                onClick={() => router.push("/dashboard")}
                className="group px-8 py-4 bg-gradient-to-r from-green-400 to-emerald-400 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                Start Exploring
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </button>
              
              <button
                onClick={() => router.push("/map")}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border-2 border-white/30 hover:bg-white/20 transition-all duration-300"
              >
                View Map
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-6 mt-12"
            >
              <div className="text-left">
                <div className="text-3xl font-bold text-white">50+</div>
                <div className="text-sm text-green-200">Monitoring Stations</div>
              </div>
              <div className="text-left">
                <div className="text-3xl font-bold text-white">24/7</div>
                <div className="text-sm text-green-200">Real-time Updates</div>
              </div>
              <div className="text-left">
                <div className="text-3xl font-bold text-white">99%</div>
                <div className="text-sm text-green-200">Accuracy Rate</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Animated Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            {/* Animated Earth/Air Quality Visual */}
            <div className="relative w-full h-[500px] flex items-center justify-center">
              
              {/* Outer rotating ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute w-96 h-96 border-2 border-green-300/30 rounded-full"
              />
              
              {/* Middle rotating ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="absolute w-80 h-80 border-2 border-emerald-300/20 rounded-full"
              />

              {/* Center Earth/Globe */}
              <motion.div
                animate={{ 
                  y: [0, -20, 0],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-64 h-64 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full shadow-2xl overflow-hidden"
              >
                {/* Earth texture overlay */}
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute inset-0 bg-green-700 rounded-full animate-pulse" />
                </div>
                
                {/* Floating icons around */}
                {[
                  { Icon: Wind, delay: 0, angle: 0 },
                  { Icon: Leaf, delay: 0.5, angle: 90 },
                  { Icon: TrendingDown, delay: 1, angle: 180 },
                  { Icon: Activity, delay: 1.5, angle: 270 },
                ].map(({ Icon, delay, angle }, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center"
                    initial={{
                      x: 0,
                      y: 0,
                    }}
                    animate={{
                      x: Math.cos((angle * Math.PI) / 180) * 150,
                      y: Math.sin((angle * Math.PI) / 180) * 150,
                      rotate: 360,
                    }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear",
                      delay: delay,
                    }}
                  >
                    <Icon className="w-6 h-6 text-green-600" />
                  </motion.div>
                ))}
              </motion.div>

              {/* Pulsing glow effect */}
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.1, 0.3],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute w-80 h-80 bg-green-400 rounded-full blur-3xl"
              />
            </div>
          </motion.div>
        </div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20"
        >
          {[
            {
              icon: <Wind className="w-8 h-8" />,
              title: "Real-time Monitoring",
              desc: "Track air quality levels across multiple locations in real-time"
            },
            {
              icon: <Activity className="w-8 h-8" />,
              title: "Predictive Analytics",
              desc: "AI-powered forecasts for better planning and decision making"
            },
            {
              icon: <Leaf className="w-8 h-8" />,
              title: "Health Insights",
              desc: "Personalized recommendations based on current air quality"
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + i * 0.1 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105"
            >
              <div className="text-green-300 mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-green-100">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
    </>
  );
}
