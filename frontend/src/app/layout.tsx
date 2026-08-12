import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppLayout } from "@/components/layout/app-layout";
import { StoreHydrationGate } from "@/components/providers/store-hydration-gate";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CareerPilot AI — Personal Career Cockpit",
  description:
    "Job search command center — match roles, search LinkedIn/Naukri/Indeed, track applications, and AI prep.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <StoreHydrationGate>
          <AppLayout>{children}</AppLayout>
        </StoreHydrationGate>
      </body>
    </html>
  );
}
