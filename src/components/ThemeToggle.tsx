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
 * cascading renders or useEffect setState warnings.
 */
export default function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggleTheme() {
    const nextTheme = !isDark;

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

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className="relative inline-flex items-center justify-center w-8 h-8 rounded-lg border border-[#E5E0D7] dark:border-[#33303C] hover:border-[#D4CCBF] dark:hover:border-[#444050] bg-[#FFFFFF] dark:bg-[#201E25] text-[#25232A] dark:text-[#F5F3EF] hover:bg-[#EFECE5]/60 dark:hover:bg-[#2A2731]/60 transition-colors cursor-pointer"
    >
      {isDark ? (
        /* Sun Icon (displayed in dark mode) */
        <svg
          className="w-4 h-4 text-[#C58A37]"
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
        /* Moon Icon (displayed in light mode) */
        <svg
          className="w-4 h-4 text-[#77716C]"
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
    </button>
  );
}
