import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SnipQA — Playwright & Cypress Snippet Library",
  description: "Search 60+ real-world Playwright and Cypress code snippets, or use AI to generate exactly what you need. Free for QA automation engineers.",
  keywords: ["playwright snippets", "cypress snippets", "test automation", "QA code library", "playwright examples", "cypress examples", "automation testing"],
  openGraph: {
    title: "SnipQA — Playwright & Cypress Snippet Library",
    description: "Search 60+ real-world Playwright and Cypress code snippets, or use AI to generate exactly what you need.",
    url: "https://snipqa.vercel.app",
    siteName: "SnipQA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SnipQA — Playwright & Cypress Snippet Library",
    description: "Search 60+ real-world Playwright and Cypress code snippets, or use AI to generate exactly what you need.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://snipqa.vercel.app",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
