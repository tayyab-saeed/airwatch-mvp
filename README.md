<div align="center">

# 🌍 AirWatch MVP

### Real-Time Air Quality Monitoring & Forecasting Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

*Empowering communities with actionable air quality insights powered by machine learning and real-time data*

[Screenshots](#-screenshots) · [Features](#-key-features) · [Tech Stack](#-tech-stack) · [Architecture](#-architecture)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Screenshots](#-screenshots)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [How to Use](#-how-to-use)
- [Project Structure](#-project-structure)
- [Acknowledgments](#-acknowledgments)
- [Contact](#-contact--support)

---

## 🌟 Overview

**AirWatch MVP** is a comprehensive air quality monitoring platform that leverages machine learning to predict air pollution levels based on geographical coordinates. Built for the **NASA Space Apps Challenge**, AirWatch empowers users with real-time air quality insights, interactive visualizations, and location-based predictions.

The platform combines a powerful **FastAPI backend** with an **XGBoost machine learning model** and a sleek **Next.js frontend** to deliver accurate AQI (Air Quality Index) predictions for six major pollutants: PM2.5, PM10, O₃, NO₂, CO, and SO₂.

### 🎯 Mission

To provide accessible, real-time air quality information that helps communities make informed decisions about their health and environment.

---

## ✨ Key Features

### 🗺️ Interactive Map
- **Click-to-Predict**: Click anywhere on the map to get instant air quality predictions
- **Real-time Visualization**: Heatmap layers showing pollution distribution
- **Geolocation Support**: Automatically center on user's current location
- **Custom Markers**: Visual indicators for air quality levels with color-coded badges

### 📊 Comprehensive Dashboard
- **Real-time AQI Metrics**: Current air quality index with health recommendations
- **Historical Trends**: 30-day historical data with interactive charts
- **Pollutant Breakdown**: Detailed breakdown of all six pollutants
- **Location-based Insights**: Automatic detection and display of user's location

### 🔮 Forecast & Comparison
- **Multi-location Comparison**: Compare air quality across different locations
- **Predictive Analytics**: Machine learning-powered predictions
- **Time-series Visualization**: Track air quality trends over time
- **Export Data**: Download air quality reports for analysis

### ⚙️ Settings & Customization
- **API Health Check**: Monitor backend connectivity
- **Theme Customization**: Personalize your experience
- **Notification Preferences**: Set alerts for poor air quality
- **Data Refresh Control**: Configure update intervals

### 🚀 Technical Highlights
- **Lightning-fast Performance**: Next.js 15 with Turbopack
- **Type Safety**: Full TypeScript implementation
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Smooth Animations**: Framer Motion for delightful interactions
- **Modern UI**: Ant Design components with custom styling
- **Robust API**: FastAPI with automatic documentation

---

## 📸 Screenshots

### Landing Page
![Landing Page](screenshots/landing.png)
*Beautiful animated landing page with environmental imagery and call-to-action buttons*

### Dashboard
![Dashboard](screenshots/dashboard.png)
*Real-time air quality metrics, charts, and pollutant breakdown with location-based data*

### Interactive Map
![Map View](screenshots/map.png)
*Click-to-predict functionality with AQI color scale, instructions, and interactive Mapbox integration*

### Forecast Tool
![Forecast](screenshots/forecast.png)
*Predictive analysis with current, peak, and average AQI metrics plus forecast confidence*

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15.5.4 with App Router
- **Language**: TypeScript 5.0
- **UI Library**: React 19.1.0
- **Styling**: 
  - Tailwind CSS 4.0
  - Ant Design 5.10.0
- **Maps**: Mapbox GL JS 3.0.1
- **Charts**: Recharts 2.8.0
- **Animations**: Framer Motion 10.16.4
- **Icons**: Lucide React 0.263.1
- **Date Handling**: date-fns 2.30.0, dayjs 1.11.10

### Backend
- **Framework**: FastAPI
- **Server**: Uvicorn
- **ML Model**: XGBoost Multi-Output Regressor
- **Data Processing**: Pandas
- **Model Persistence**: joblib
- **ML Libraries**: scikit-learn

### DevOps
- **Package Manager**: npm/yarn
- **Build Tool**: Turbopack
- **Linting**: ESLint 9
- **Type Checking**: TypeScript Compiler

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Next.js 15 (App Router) + TypeScript               │   │
│  │  ├─ Pages (Dashboard, Map, Forecast, Settings)      │   │
│  │  ├─ Components (AirQualityMap, Charts, Layout)      │   │
│  │  ├─ Services (API Client with retry logic)          │   │
│  │  └─ Utils (Data transformation, AQI calculations)   │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST API
                       │ (JSON)
┌──────────────────────▼──────────────────────────────────────┐
│                     Backend API                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  FastAPI + Uvicorn                                   │   │
│  │  ├─ /health - Health check endpoint                 │   │
│  │  ├─ /predict - Air quality prediction endpoint      │   │
│  │  └─ Auto-generated docs (/docs, /redoc)             │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                ML Model Layer                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  XGBoost Multi-Output Regressor                      │   │
│  │  ├─ Inputs: Latitude, Longitude                      │   │
│  │  └─ Outputs: PM2.5, PM10, O₃, NO₂, CO, SO₂          │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 How to Use

#### 🏠 Landing Page
- Click **"Explore Dashboard"** to view your local air quality
- Browse features and learn about the platform

#### 📊 Dashboard
- View real-time AQI for your location
- Explore historical trends (30-day chart)
- Check detailed pollutant breakdown
- Monitor health recommendations

#### 🗺️ Interactive Map
- Click anywhere on the map to get predictions
- View detailed popups with AQI and pollutant levels
- Use the geolocate control to center on your location
- Explore the heatmap layer for regional insights

#### 🔮 Forecast
- Compare air quality across multiple locations
- View predictive trends
- Export data for further analysis

#### ⚙️ Settings
- Test API connectivity with health check
- Customize your preferences
- Configure notifications

---

## 📁 Project Structure

```
airwatch-mvp/
├── airwatch-mvp-backend/          # FastAPI Backend
│   ├── main.py                    # Main application file
│   ├── requirements.txt           # Python dependencies
│   ├── xgboost_air_quality_model.joblib  # Trained ML model
│   └── README.md                  # Backend documentation
│
├── airwatch-mvp-frontend/         # Next.js Frontend
│   ├── src/
│   │   ├── app/                   # Next.js App Router
│   │   │   ├── page.tsx           # Landing page
│   │   │   ├── layout.tsx         # Root layout
│   │   │   ├── dashboard/         # Dashboard page
│   │   │   ├── map/               # Map page
│   │   │   ├── forecast/          # Forecast page
│   │   │   └── settings/          # Settings page
│   │   │
│   │   ├── components/            # React Components
│   │   │   ├── AirQualityMap.tsx  # Mapbox map component
│   │   │   ├── ForecastChart.tsx  # Chart components
│   │   │   ├── ComparisonTool.tsx # Location comparison
│   │   │   ├── DashboardLayout.tsx # Layout wrapper
│   │   │   └── HeaderBar.tsx      # Navigation header
│   │   │
│   │   ├── services/              # API Services
│   │   │   └── api.ts             # API client with retry logic
│   │   │
│   │   ├── types/                 # TypeScript Types
│   │   │   └── api.ts             # API type definitions
│   │   │
│   │   └── utils/                 # Utility Functions
│   │       ├── airQuality.ts      # AQI calculations
│   │       └── dataTransform.ts   # Data transformation
│   │
│   ├── public/                    # Static assets
│   ├── package.json               # Dependencies
│   ├── tsconfig.json              # TypeScript config
│   ├── next.config.ts             # Next.js config
│   └── tailwind.config.js         # Tailwind CSS config
│
├── docs/                          # Additional Documentation
│   ├── ARCHITECTURE_OVERVIEW.md
│   ├── GETTING_STARTED.md
│   └── QUICK_REFERENCE_GUIDE.md
│
└── README.md                      # This file
```

---

## 🎨 Features in Detail

### Air Quality Index (AQI) Scale

The platform uses the standard AQI scale:

| AQI Range | Level | Color | Health Impact |
|-----------|-------|-------|---------------|
| 0-50 | Good | 🟢 Green | Air quality is satisfactory |
| 51-100 | Moderate | 🟡 Yellow | Acceptable for most people |
| 101-150 | Unhealthy for Sensitive Groups | 🟠 Orange | Sensitive groups may experience effects |
| 151-200 | Unhealthy | 🔴 Red | Everyone may begin to experience effects |
| 201-300 | Very Unhealthy | 🟣 Purple | Health alert: everyone may experience serious effects |
| 301+ | Hazardous | 🟤 Maroon | Emergency conditions: entire population affected |

### Pollutants Monitored

1. **PM2.5** - Fine particulate matter (< 2.5 μm)
2. **PM10** - Coarse particulate matter (< 10 μm)
3. **O₃** - Ground-level ozone
4. **NO₂** - Nitrogen dioxide
5. **CO** - Carbon monoxide
6. **SO₂** - Sulfur dioxide

---

## 🙏 Acknowledgments

- **NASA Space Apps Challenge 2025** - For inspiring this project and providing the platform to address global environmental challenges
- **Open-source Community** - For the amazing tools and libraries that made this project possible
- **Mapbox** - For providing powerful mapping and geolocation services
- **XGBoost Team** - For the robust machine learning framework

---

## 📞 Contact & Support

For inquiries about this project, please reach out:

- **Project Repository**: [GitHub](https://github.com/yourusername/airwatch-mvp)
- **NASA Space Apps Challenge**: [2025 Submission](https://www.spaceappschallenge.org/)

---

<div align="center">

### ⭐ Star us on GitHub — it motivates us a lot!

Made with ❤️ for NASA Space Apps Challenge 2025

[⬆ Back to Top](#-airwatch-mvp)

</div>
