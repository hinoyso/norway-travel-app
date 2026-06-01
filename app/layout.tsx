import type { Metadata, Viewport } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { LanguageProvider } from "@/lib/i18n";
import { Toaster } from "@/components/ui/toaster";

const rubik = Rubik({
  subsets: ["latin", "hebrew"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Norway Adventure",
  description: "Your personal Norway travel companion — day-by-day itinerary, maps, weather, and more.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Norway",
  },
  formatDetection: { telephone: false },
  manifest: "/manifest.json",
  icons: {
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152" },
      { url: "/icons/icon-192x192.png", sizes: "192x192" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1B4F8A" },
    { media: "(prefers-color-scheme: dark)", color: "#0D1B2A" },
  ],
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={rubik.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LanguageProvider>
            {children}
            <Toaster />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
