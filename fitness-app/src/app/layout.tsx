import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StagewiseToolbar } from "@stagewise/toolbar-next";
import { ReactPlugin } from "@stagewise-plugins/react";
import BottomNavigation from "@/components/BottomNavigation";
import { WorkoutProvider } from "@/components/WorkoutContext";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Fitness Dashboard",
  description: "Comprehensive fitness tracking and workout management app",
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#1A1A1A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StagewiseToolbar 
          config={{
            plugins: [ReactPlugin]
          }}
        />
        <WorkoutProvider>
          <main style={{ paddingBottom: '100px' }}>
            {children}
          </main>
          <BottomNavigation />
        </WorkoutProvider>
      </body>
    </html>
  );
}
