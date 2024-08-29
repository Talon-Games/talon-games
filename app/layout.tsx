import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthContextProvider } from "@/lib/contexts/authContext";
import NavBar from "@/components/general/navBar";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#fbcd6a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://talon-games.shsdevs.com"),
  title: "Talon Games",
  description: "Games for the Sharon Talon Newspaper",
  keywords: [
    "newspaper",
    "sharon",
    "games",
    "crossword",
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
  manifest: "https://talon-games.shsdevs.com/manifest.json",
  openGraph: {
    title: "Talon Games",
    description: "Games for the Sharon Talon Newspaper",
    url: "https://talon-games.shsdevs.com",
    siteName: "Talon Games",
    images: [
      {
        url: "https://talon-games.shsdevs.com/logo/logo-without-name.png",
        width: 600,
        height: 600,
        alt: "Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: "/logo/logo-without-name.png",
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
        className={`${inter.className} bg-background-50 flex flex-col items-center justify-between`}
      >
        <AuthContextProvider>
          <NavBar />
          <h1 className="font-heading text-8xl text-accent-800 max-sm:text-7xl max-xs:text-6xl">
            Talon Games
          </h1>
          <div className="w-5/6 ml-auto mr-auto">{children}</div>
        </AuthContextProvider>
        <footer className="bg-accent-100 rounded-xl p-5 mb-4 w-5/6 flex justify-between">
          <a
            href="https://github.com/cqb13/talon-games/blob/main/LICENSE"
            className="hover:text-secondary-600 transition-all duration-200 ease-in-out"
            target="_blank"
          >
            Copyright © 2024
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
    </html>
  );
}
