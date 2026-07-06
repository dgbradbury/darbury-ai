import type { Metadata } from "next";
import { Barlow_Condensed, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ChatWidget from "@/components/chat/ChatWidget";

const barlow = Barlow_Condensed({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.darbury.ai"),
  title: {
    default: "Dave Bradbury | Darbury — Engineering AI & Automation",
    template: "%s | Darbury AI",
  },
  description:
    "42 years of engineering problems. Solved faster with AI. Engineering technology consultancy specialising in CAD automation, AI tooling, and intelligent workflows.",
  keywords: [
    "engineering automation",
    "AI tooling",
    "AutoCAD",
    "Plant 3D",
    "P&ID analysis",
    "MCP server",
    "digital twin",
    "Darbury",
    "Dave Bradbury",
  ],
  openGraph: {
    type: "website",
    siteName: "Darbury AI",
    url: "https://www.darbury.ai",
    locale: "en_GB",
    title: "Darbury AI — Engineering AI & Automation",
    description:
      "42 years of engineering problems. Solved faster with AI. Live AI tools built on real Plant 3D, P&ID and CAD workflows.",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@dgbradbury",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${barlow.variable} ${inter.variable} ${jetbrains.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased">
        <Header />
        <div className="flex-1 flex flex-col">
          {children}
        </div>
        <Footer />
        <ChatWidget />
      </body>
    </html>
  );
}
