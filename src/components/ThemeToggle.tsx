"use client";

import { useSyncExternalStore } from "react";

/**
 * Subscribes to changes in theme across tabs / storage events.
 */
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

/**
 * Client Snapshot: Reads the active theme directly from document.documentElement
 */
function getSnapshot(): boolean {
  return typeof document !== "undefined" && document.documentElement.classList.contains("dark");
}

/**
 * Server Snapshot: Defaults to false during initial SSR
 */
function getServerSnapshot(): boolean {
  return false;
}

/**
 * ThemeToggle Component
 * 
 * Provides a clean micro-interaction button to toggle between Light and Dark themes.
 * Utilizes `useSyncExternalStore` for idiomatic React 19 / Next.js hydration without
 * cascading renders, while providing a buttery-smooth cross-fade animation across the
 * entire application using View Transitions API and CSS variable easing.
 */
export default function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function applyTheme(nextTheme: boolean) {
    if (nextTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("devflow_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("devflow_theme", "light");
    }

    // Dispatch event to trigger re-read across listeners
    window.dispatchEvent(new Event("storage"));
  }

  function toggleTheme() {
    const nextTheme = !isDark;

    // 1. Temporarily activate smooth theme-transition class on root
    if (typeof document !== "undefined") {
      document.documentElement.classList.add("theme-transition");
    }

    // 2. Hardware-accelerated View Transitions API (Chrome 111+, Edge 111+, Safari 18+)
    if (
      typeof document !== "undefined" &&
      "startViewTransition" in document &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      try {
        const transition = (document as unknown as { startViewTransition: (cb: () => void) => { finished: Promise<void> } }).startViewTransition(() => {
          applyTheme(nextTheme);
        });

        transition.finished.finally(() => {
          document.documentElement.classList.remove("theme-transition");
        });
        return;
      } catch {
        // Fallback to CSS transitions below
      }
    }

    // 3. Fallback smooth CSS transition for browsers without View Transitions
    applyTheme(nextTheme);
    if (typeof window !== "undefined") {
      window.setTimeout(() => {
        document.documentElement.classList.remove("theme-transition");
      }, 450);
    }
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className="relative inline-flex items-center justify-center w-8 h-8 rounded-lg border border-[#E5E0D7] dark:border-[#33303C] hover:border-[#D4CCBF] dark:hover:border-[#444050] bg-[#FFFFFF] dark:bg-[#201E25] text-[#25232A] dark:text-[#F5F3EF] hover:bg-[#EFECE5]/60 dark:hover:bg-[#2A2731]/60 transition-all duration-200 active:scale-95 cursor-pointer overflow-hidden group"
    >
      <span className="relative flex items-center justify-center transition-transform duration-300">
        {isDark ? (
          /* Sun Icon (displayed in dark mode with radiant amber glow & smooth rotation) */
          <svg
            className="w-4 h-4 text-[#C58A37] transition-transform duration-300 group-hover:rotate-45"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        ) : (
          /* Moon Icon (displayed in light mode with smooth tilt) */
          <svg
            className="w-4 h-4 text-[#77716C] group-hover:text-[#6D4AFF] transition-all duration-300 group-hover:-rotate-12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        )}
      </span>
    </button>
  );
}
