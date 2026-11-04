import React from "react";

/**
 * Loading Component (Next.js Suspense Fallback)
 * 
 * Automatically rendered by Next.js while server components (page.tsx)
 * are fetching data, performing initial render, or streaming updates.
 */
export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 transition-colors duration-200">
      {/* Brand Icon + Spinning Ring */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/10 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-500/20">
            {/* Spinning Circle Indicator */}
            <svg
              className="w-7 h-7 animate-spin text-blue-600 dark:text-blue-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="opacity-80"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          </div>
        </div>

        {/* Loading text feedback */}
        <div className="text-center space-y-1.5">
          <p className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center justify-center gap-2">
            <span>DevFlow</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-slate-500 dark:text-slate-400 font-medium">Syncing Workspace</span>
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500 font-mono">
            Connecting to Neon PostgreSQL...
          </p>
        </div>
      </div>
    </div>
  );
}
