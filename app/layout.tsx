import { CrosswordContextProvider } from "@/lib/contexts/crosswordContext";
import { AuthContextProvider } from "@/lib/contexts/authContext";
import { GoogleAnalytics } from "@next/third-parties/google";
import NavBar from "@/components/general/navBar";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f2f2f2",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://games.shstalon.com"),
  title: "Talon Games",
  description: "Games for the Sharon Talon Newspaper",
  keywords: [
    "shs talon",
    "shs",
    "sharon",
    "talon games",
    "sharon talon",
    "talon",
  ],
  category: "games",
  generator: "Next.js",
  applicationName: "Talon Games",
  referrer: "origin-when-cross-origin",
  authors: [{ name: "Maksim Straus", url: "https://maksimstraus.dev" }],
  creator: "Maksim Straus",
  publisher: "Maksim Straus",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "https://games.shstalon.com/manifest.json",
  openGraph: {
    title: "Talon Games",
    description: "Games for the Sharon Talon Newspaper",
    url: "https://games.shstalon.com",
    siteName: "Talon Games",
    images: [
      {
        url: "https://games.shstalon.com/logo/TalonGamesC.png",
        width: 600,
        height: 600,
        alt: "Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: "/logo/TalonGamesC.png",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": "auto",
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} min-h-screen bg-background-white text-accent-900 flex flex-col`}
      >
        <div className="flex-grow w-full flex flex-col">
          <AuthContextProvider>
            <NavBar />
            {children}
          </AuthContextProvider>
        </div>
        <footer className="text-sm p-4 w-full flex justify-between">
          <a
            href="https://github.com/Talon-Games/talon-games/blob/main/LICENSE"
            className="hover:text-secondary-600 transition-all duration-200 ease-in-out"
            target="_blank"
          >
            Copyright © 2025
          </a>
          <a
            href="https://maksimstraus.dev"
            className="hover:text-secondary-600 transition-all duration-200 ease-in-out"
            target="_blank"
          >
            Created by: Maksim Straus
          </a>
        </footer>
      </body>
      <GoogleAnalytics gaId="G-417W6PRD43" />
    </html>
  );
}
