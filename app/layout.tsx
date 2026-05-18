import "./globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Squadco Escrow — Hire Nigeria's hustle. Pay only when it's done.",
  description:
    "Squadco Escrow is the discovery + escrow-protected job marketplace for the 92% of Nigerians who work informally. NIN-verified workers. Squad-secured payments. T+1 to your bank.",
  applicationName: "Squadco Escrow",
  keywords: ["Squadco", "Squadco Escrow", "Squad", "GTCO", "Nigeria", "gig", "escrow", "artisan", "informal economy"],
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="page-bg min-h-screen text-ink antialiased">
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
