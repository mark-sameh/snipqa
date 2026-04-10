import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SnipQA — Playwright & Cypress Snippet Library",
  description: "Search, browse, and generate Playwright and Cypress code snippets. Describe what you need, get a working snippet instantly.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
