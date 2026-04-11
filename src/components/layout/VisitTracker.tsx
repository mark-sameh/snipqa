"use client";
import { useEffect } from "react";

// Invisible component — fires one silent POST on every page load.
// Renders nothing; import it into any Server Component layout.
export default function VisitTracker() {
  useEffect(() => {
    fetch("/api/track-visit", { method: "POST" }).catch(() => {});
  }, []);

  return null;
}
