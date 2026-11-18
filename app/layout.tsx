import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "../src/styles/cue.css";

export const metadata: Metadata = {
  title: "Cue Streaming Prototype",
  description: "An interactive streaming prototype for web, mobile and TV with AI-assisted discovery.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0c0e14" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Figtree:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
