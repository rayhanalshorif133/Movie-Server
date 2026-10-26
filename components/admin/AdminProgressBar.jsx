"use client";

import { useEffect, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function ProgressBarInternal() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Complete progress bar whenever route pathname or searchParams change
  useEffect(() => {
    if (loading) {
      setProgress(100);
      const timer = setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleStart = () => {
      setLoading(true);
      setProgress((prev) => (prev === 0 ? 25 : prev));
    };

    const handleComplete = () => {
      setProgress(100);
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 250);
    };

    const handleClick = (e) => {
      const anchor = e.target.closest("a");
      if (!anchor) return;

      const target = anchor.getAttribute("target");
      if (target === "_blank") return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("javascript:")) return;

      // Ignore external or non-http links
      if (href.startsWith("mailto:") || href.startsWith("tel:") || anchor.hasAttribute("download")) return;

      const currentFullUrl = window.location.pathname + window.location.search;
      if (href === currentFullUrl || href === window.location.pathname) {
        return;
      }

      // Trigger if internal link
      if (href.startsWith("/") || href.startsWith(window.location.origin)) {
        handleStart();
      }
    };

    const handlePopState = () => {
      handleStart();
    };

    document.addEventListener("click", handleClick);
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("admin-nav-start", handleStart);
    window.addEventListener("admin-nav-end", handleComplete);

    return () => {
      document.removeEventListener("click", handleClick);
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("admin-nav-start", handleStart);
      window.removeEventListener("admin-nav-end", handleComplete);
    };
  }, []);

  // Trickle progress incrementally while loading
  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        const step = Math.max(0.5, (90 - prev) * 0.15);
        return Math.min(90, prev + step);
      });
    }, 120);

    return () => clearInterval(interval);
  }, [loading]);

  if (!loading && progress === 0) return null;

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none h-1 overflow-hidden"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
    >
      <div
        className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-400 shadow-[0_0_14px_rgba(37,99,235,0.8)] transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          transition: progress === 100 
            ? "width 150ms ease-out, opacity 250ms ease-in 100ms" 
            : "width 200ms ease-out"
        }}
      />
    </div>
  );
}

export default function AdminProgressBar() {
  return (
    <Suspense fallback={null}>
      <ProgressBarInternal />
    </Suspense>
  );
}

