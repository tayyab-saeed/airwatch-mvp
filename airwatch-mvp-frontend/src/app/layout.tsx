import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// Ant Design styles
import "antd/dist/reset.css";
import { ConfigProvider, App } from "antd";
import { AntdRegistry } from '@ant-design/nextjs-registry';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AirWatch - Air Quality Monitoring",
  description: "Real-time air quality monitoring and forecasting platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
      >
      <AntdRegistry>
        <ConfigProvider
          theme={{
            token: {
              // example: change the primary color for Ant Design components
              colorPrimary: "#1677ff",
            },
          }}
          warning={{
            strict: false, // Suppress React 19 compatibility warning
          }}
        >
          <App>
            {children}
          </App>
        </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
