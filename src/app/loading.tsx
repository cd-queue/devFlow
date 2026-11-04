import React from "react";

/**
 * Loading Component (Next.js Suspense Fallback)
 * 
 * Automatically rendered by Next.js while server components (page.tsx)
 * are fetching data, performing initial render, or streaming updates.
 */
export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F7F5F0] dark:bg-[#141318] flex flex-col items-center justify-center p-6 transition-colors duration-200 selection:bg-[#F0ECFF] selection:text-[#6D4AFF]">
      {/* Brand Icon + Spinning Indicator */}
      <div className="flex flex-col items-center gap-5">
        <div className="relative flex items-center justify-center">
          <div className="w-11 h-11 rounded-xl bg-[#25232A] dark:bg-[#F5F3EF] flex items-center justify-center text-[#F7F5F0] dark:text-[#25232A] shadow-xs">
            {/* Geometric flow mark */}
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 7h10M4 12h16M4 17h12"
              />
            </svg>
          </div>
          {/* Subtle spinning ring around brand icon */}
          <div className="absolute -inset-2 rounded-2xl border-2 border-transparent border-t-[#6D4AFF] dark:border-t-[#8A6BFF] animate-spin" />
        </div>

        {/* Loading text feedback */}
        <div className="text-center space-y-1.5">
          <p className="text-sm font-bold text-[#25232A] dark:text-[#F5F3EF] tracking-tight flex items-center justify-center gap-2">
            <span>Dev<span className="text-[#6D4AFF] dark:text-[#8A6BFF]">Flow</span></span>
            <span className="text-[#E5E0D7] dark:text-[#2A2731]">•</span>
            <span className="text-[#77716C] dark:text-[#A6A099] font-medium">Syncing Workspace</span>
          </p>
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-[#969089] dark:text-[#757069]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#278568] animate-pulse" />
            <span>Connecting to Neon PostgreSQL...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
